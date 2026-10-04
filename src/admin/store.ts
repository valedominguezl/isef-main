/**
 * Almacenamiento del contenido para el panel.
 * - LocalStore: `npm run dev` → escribe directo en el disco (scripts/vite-content-api.ts).
 * - GitHubStore: producción → lee del repo y publica todos los cambios en UN commit
 *   (Git Data API). Ese push a `main` dispara el deploy de GitHub Actions.
 */

export interface FileEntry {
  name: string;
  path: string;
}

export type Change =
  | { path: string; content: string; encoding: 'utf8' | 'base64'; label: string }
  | { path: string; delete: true; label: string };

export interface ContentStore {
  readonly kind: 'local' | 'github';
  list(dir: string): Promise<FileEntry[]>;
  read(path: string): Promise<string | null>;
  commit(changes: Change[], message: string): Promise<void>;
}

/* ───────────────────────────── Local (dev) ───────────────────────────── */
export class LocalStore implements ContentStore {
  readonly kind = 'local' as const;

  async list(dir: string) {
    const r = await fetch(`/__content/list?dir=${encodeURIComponent(dir)}`);
    if (!r.ok) throw new Error(`No se pudo listar ${dir}`);
    return (await r.json()) as FileEntry[];
  }

  async read(path: string) {
    const r = await fetch(`/__content/file?path=${encodeURIComponent(path)}`);
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`No se pudo leer ${path}`);
    return ((await r.json()) as { content: string }).content;
  }

  async commit(changes: Change[]) {
    for (const c of changes) {
      const url = `/__content/file?path=${encodeURIComponent(c.path)}`;
      const r =
        'delete' in c
          ? await fetch(url, { method: 'DELETE' })
          : await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: c.content, encoding: c.encoding }) });
      if (!r.ok) throw new Error(`Error guardando ${c.path}`);
    }
  }
}

/* ─────────────────────────────── GitHub ──────────────────────────────── */
export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

const utf8ToBase64 = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
};
const base64ToUtf8 = (b64: string) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

export class GitHubStore implements ContentStore {
  readonly kind = 'github' as const;
  constructor(private cfg: GitHubConfig) {}

  private async api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const r = await fetch(`https://api.github.com/repos/${this.cfg.owner}/${this.cfg.repo}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.cfg.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
      cache: 'no-store',
    });
    if (!r.ok) {
      const body = await r.text();
      if (r.status === 401) throw new Error('El token no es válido o venció. Volvé a iniciar sesión.');
      if (r.status === 403) throw new Error('El token no tiene permisos suficientes (Contents: Read and write).');
      if (r.status === 404 && init.method === undefined) throw Object.assign(new Error('No encontrado'), { status: 404 });
      throw new Error(`GitHub ${r.status}: ${body.slice(0, 200)}`);
    }
    return (r.status === 204 ? undefined : await r.json()) as T;
  }

  /** Verifica el token y que tenga permiso de escritura. */
  async verify(): Promise<{ login: string }> {
    const repo = await this.api<{ permissions?: { push?: boolean } }>('');
    if (!repo.permissions?.push) throw new Error('El token puede leer el repositorio pero no escribir. Revisá el permiso "Contents: Read and write".');
    const user = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${this.cfg.token}` } });
    return { login: user.ok ? ((await user.json()) as { login: string }).login : 'admin' };
  }

  async list(dir: string) {
    try {
      const items = await this.api<{ name: string; path: string; type: string }[]>(`/contents/${dir}?ref=${this.cfg.branch}`);
      return items.filter((i) => i.type === 'file').map(({ name, path }) => ({ name, path }));
    } catch (e) {
      if ((e as { status?: number }).status === 404) return [];
      throw e;
    }
  }

  async read(path: string) {
    try {
      const f = await this.api<{ content: string; encoding: string }>(`/contents/${encodeURI(path)}?ref=${this.cfg.branch}`);
      return base64ToUtf8(f.content);
    } catch (e) {
      if ((e as { status?: number }).status === 404) return null;
      throw e;
    }
  }

  async commit(changes: Change[], message: string) {
    const ref = await this.api<{ object: { sha: string } }>(`/git/ref/heads/${this.cfg.branch}`);
    const base = await this.api<{ tree: { sha: string } }>(`/git/commits/${ref.object.sha}`);
    const tree = [];
    for (const c of changes) {
      if ('delete' in c) {
        tree.push({ path: c.path, mode: '100644', type: 'blob', sha: null });
        continue;
      }
      const blob = await this.api<{ sha: string }>('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: c.encoding === 'base64' ? c.content : utf8ToBase64(c.content), encoding: 'base64' }),
      });
      tree.push({ path: c.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await this.api<{ sha: string }>('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: base.tree.sha, tree }) });
    const commit = await this.api<{ sha: string }>('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
    });
    await this.api(`/git/refs/heads/${this.cfg.branch}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha }) });
  }

  /** Estado del último deploy (workflow de GitHub Actions en la rama). */
  async lastDeploy(): Promise<{ status: string; conclusion: string | null; url: string; createdAt: string } | null> {
    try {
      const r = await this.api<{ workflow_runs: { status: string; conclusion: string | null; html_url: string; created_at: string }[] }>(
        `/actions/runs?branch=${this.cfg.branch}&per_page=1`,
      );
      const run = r.workflow_runs[0];
      return run ? { status: run.status, conclusion: run.conclusion, url: run.html_url, createdAt: run.created_at } : null;
    } catch {
      return null;
    }
  }
}

/* ─────────────────────── Capa de cambios pendientes ─────────────────────
 * Los cambios se acumulan (y sobreviven a recargas) hasta que se publican.
 */
const PENDING_KEY = 'isef-admin-pending-v1';

export function loadPending(): Change[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]') as Change[];
  } catch {
    return [];
  }
}

export function savePending(changes: Change[]) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(changes));
  } catch {
    /* imágenes muy grandes pueden exceder la cuota: quedan solo en memoria */
  }
}

/** Lee aplicando los cambios pendientes por encima del almacenamiento real. */
export async function readWithPending(store: ContentStore, pending: Change[], path: string) {
  const p = pending.find((c) => c.path === path);
  if (p) return 'delete' in p ? null : p.encoding === 'utf8' ? p.content : null;
  return store.read(path);
}

export async function listWithPending(store: ContentStore, pending: Change[], dir: string) {
  const base = await store.list(dir);
  const map = new Map(base.map((f) => [f.path, f]));
  for (const c of pending) {
    if (!c.path.startsWith(`${dir}/`) || c.path.slice(dir.length + 1).includes('/')) continue;
    if ('delete' in c) map.delete(c.path);
    else map.set(c.path, { name: c.path.split('/').pop()!, path: c.path });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
