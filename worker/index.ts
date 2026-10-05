/**
 * Worker del sitio: sirve los archivos estáticos (dist/) y, solo bajo /api/*, la búsqueda de fotos del panel:
 *   GET /api/fotos?q=…               → fotos de stock gratuitas de dominio público (Openverse, CC0/PDM)
 *   GET /api/fotos/descargar?url=…   → baja la foto elegida (solo de bancos de imágenes) para procesarla en el panel
 * Gratis: no usa servicios pagos ni claves. Exige la contraseña del panel (token de GitHub con permiso de escritura).
 */

interface Env {
  ASSETS: Fetcher;
}

const REPO = 'valedominguezl/isef-main';

/* ───────────────────────── Utilidades ───────────────────────── */

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const error = (status: number, mensaje: string) => json({ error: mensaje }, status);

/** Contraseñas ya verificadas (token → vence): evita consultar a GitHub en cada pedido. */
const verificados = new Map<string, number>();

/** La "contraseña" del panel es un token de GitHub: tiene que poder escribir en el repositorio del sitio. */
/** 'limite' = GitHub frenó las consultas por un rato (no es la contraseña). */
async function autorizado(req: Request): Promise<'si' | 'no' | 'limite'> {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return 'no';
  const vence = verificados.get(token);
  if (vence && vence > Date.now()) return 'si';
  const r = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json', 'user-agent': 'isef-sanluis-admin' },
  });
  if ((r.status === 403 || r.status === 429) && r.headers.get('x-ratelimit-remaining') === '0') return 'limite';
  if (!r.ok) return 'no';
  const repo = (await r.json()) as { permissions?: { push?: boolean } };
  if (!repo.permissions?.push) return 'no';
  verificados.set(token, Date.now() + 10 * 60_000);
  return 'si';
}

/* ───────────────────────── Fotos de stock ───────────────────────── */

interface Foto {
  miniatura: string;
  url: string;
  autor: string;
  fuente: string;
  enlace: string;
}

/** Openverse, solo imágenes de dominio público (CC0/PDM): uso libre, sin citar al autor. */
async function buscarFotos(q: string): Promise<Foto[]> {
  const r = await fetch(
    `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license=cc0,pdm&license_type=commercial&aspect_ratio=wide&page_size=12&mature=false`,
    { headers: { 'user-agent': 'isef-sanluis-admin (isefsanluis.net)' } },
  );
  if (!r.ok) return [];
  const d = (await r.json()) as { results: { thumbnail: string; url: string; creator?: string; source: string; foreign_landing_url: string }[] };
  return (d.results ?? [])
    .filter((p) => fotoPermitida(p.url)) // solo las que después se pueden bajar
    .map((p) => ({ miniatura: p.thumbnail, url: p.url, autor: p.creator ?? '', fuente: p.source, enlace: p.foreign_landing_url }));
}

/** Solo se descargan fotos de los bancos de imágenes (no es un proxy abierto). */
const HOSTS_FOTOS = /(^|\.)(pexels\.com|openverse\.org|stocksnap\.io|rawpixel\.com|wikimedia\.org|staticflickr\.com|flickr\.com|unsplash\.com)$/;

function fotoPermitida(url: string): boolean {
  if (!URL.canParse(url)) return false;
  const u = new URL(url);
  return u.protocol === 'https:' && HOSTS_FOTOS.test(u.hostname);
}

async function descargarFoto(url: string): Promise<Response> {
  if (!URL.canParse(url)) return error(400, 'URL inválida.');
  const u = new URL(url);
  if (!fotoPermitida(url)) return error(400, 'Esa foto no viene de un banco de imágenes permitido.');
  const r = await fetch(u.toString(), { headers: { 'user-agent': 'isef-sanluis-admin (isefsanluis.net)' } });
  const tipo = r.headers.get('content-type') ?? '';
  if (!r.ok || !tipo.startsWith('image/')) return error(502, 'No se pudo bajar la foto.');
  return new Response(r.body, { headers: { 'content-type': tipo, 'cache-control': 'no-store' } });
}

/* ───────────────────────── Rutas ───────────────────────── */

async function api(req: Request, url: URL): Promise<Response> {
  const auth = await autorizado(req);
  if (auth === 'limite') return error(503, 'GitHub está limitando las consultas. Probá de nuevo en unos minutos.');
  if (auth === 'no') return error(401, 'Contraseña incorrecta o vencida.');

  if (url.pathname === '/api/fotos' && req.method === 'GET') {
    const q = url.searchParams.get('q')?.trim();
    if (!q) return error(400, 'Falta qué buscar.');
    return json({ fotos: await buscarFotos(q.slice(0, 80)) });
  }
  if (url.pathname === '/api/fotos/descargar' && req.method === 'GET') return descargarFoto(url.searchParams.get('url') ?? '');

  return error(404, 'No existe.');
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      // Un error de red (GitHub, Openverse) devuelve JSON claro, no la página de error de Cloudflare
      try {
        return await api(req, url);
      } catch {
        return error(502, 'No se pudo conectar con el servicio de fotos. Probá de nuevo en un rato.');
      }
    }
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
