import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { GitHubStore, LocalStore, loadPending, savePending, type Change, type ContentStore } from './store';
import { clearAdminCache } from './useEntries';
import { createApi, type AdminApi } from './api';

export const REPO = { owner: 'valedominguezl', repo: 'isef-main', branch: 'main' };
const TOKEN_KEY = 'isef-admin-token';

type Deploy = { status: string; conclusion: string | null; url: string; createdAt: string } | null;

interface AdminCtx {
  store: ContentStore | null;
  /** Verificando una sesión guardada: se muestra el esqueleto del panel, no el login. */
  checking: boolean;
  user: string | null;
  mode: 'local' | 'github';
  login: (token: string, remember: boolean) => Promise<void>;
  logout: () => void;
  useLocal: () => void;
  pending: Change[];
  /** Deja cambios pendientes. Devuelve una función que deshace exactamente eso (vuelve a lo que había antes en esos archivos). */
  stage: (changes: Change[]) => () => void;
  discard: (path?: string) => void;
  publish: (message: string) => Promise<void>;
  publishing: boolean;
  deploy: Deploy;
  refreshDeploy: () => void;
  /** URL para previsualizar un medio (incluye imágenes recién subidas y no publicadas). */
  mediaUrl: (path?: string) => string | undefined;
  /** Funciones del Worker (IA, fotos de stock), con la contraseña ya puesta. */
  api: AdminApi;
  version: number;
}

const Ctx = createContext<AdminCtx | null>(null);

/** La misma contraseña con la que se entró al panel autoriza las funciones del Worker. */
const api = createApi(() => readToken());

function readToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const devLocal = import.meta.env.DEV && localStorage.getItem('isef-admin-mode') !== 'github';
  const [store, setStore] = useState<ContentStore | null>(() => (devLocal ? new LocalStore() : null));
  const [user, setUser] = useState<string | null>(devLocal ? 'modo local' : null);
  const [checking, setChecking] = useState(() => !devLocal && Boolean(readToken()));
  const [pending, setPending] = useState<Change[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [deploy, setDeploy] = useState<Deploy>(null);
  const [version, setVersion] = useState(0);
  // Copia sincrónica de los pendientes: "Deshacer" necesita saber qué había justo antes de cada cambio
  const pendingRef = useRef<Change[]>([]);
  const writePending = useCallback((next: Change[]) => {
    pendingRef.current = next;
    savePending(next);
    setPending(next);
    setVersion((v) => v + 1);
  }, []);

  // Restaurar sesión y cambios pendientes
  useEffect(() => {
    pendingRef.current = loadPending();
    setPending(pendingRef.current);
    if (devLocal) return;
    const token = readToken();
    if (token) {
      const gh = new GitHubStore({ ...REPO, token });
      gh.verify()
        .then(({ login }) => {
          setStore(gh);
          setUser(login);
        })
        .catch((e: Error) => {
          // Solo se olvida la contraseña si fue rechazada; un corte de red no obliga a volver a escribirla
          if (/incorrecta|vencida/.test(e.message)) {
            sessionStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(TOKEN_KEY);
          }
        })
        .finally(() => setChecking(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (token: string, remember: boolean) => {
    const gh = new GitHubStore({ ...REPO, token: token.trim() });
    const { login } = await gh.verify();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token.trim());
    localStorage.setItem('isef-admin-mode', 'github');
    setStore(gh);
    setUser(login);
  }, []);

  const logout = useCallback(() => {
    clearAdminCache();
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setStore(null);
    setUser(null);
  }, []);

  const useLocal = useCallback(() => {
    localStorage.setItem('isef-admin-mode', 'local');
    setStore(new LocalStore());
    setUser('modo local');
  }, []);

  const stage = useCallback(
    (changes: Change[]) => {
      const paths = new Set(changes.map((c) => c.path));
      const before = pendingRef.current.filter((p) => paths.has(p.path));
      writePending([...pendingRef.current.filter((p) => !paths.has(p.path)), ...changes]);
      // Deshacer: esos archivos vuelven al cambio pendiente que tenían (o a lo publicado si no había)
      return () => writePending([...pendingRef.current.filter((p) => !paths.has(p.path)), ...before]);
    },
    [writePending],
  );

  const discard = useCallback(
    (path?: string) => writePending(path ? pendingRef.current.filter((p) => p.path !== path) : []),
    [writePending],
  );

  const refreshDeploy = useCallback(() => {
    if (store instanceof GitHubStore) store.lastDeploy().then(setDeploy);
  }, [store]);

  const publish = useCallback(
    async (message: string) => {
      if (!store || !pending.length) return;
      setPublishing(true);
      try {
        await store.commit(pending, message);
        writePending([]);
        setTimeout(refreshDeploy, 4000);
      } finally {
        setPublishing(false);
      }
    },
    [store, pending, refreshDeploy, writePending],
  );

  // Seguir el deploy mientras esté en curso
  useEffect(() => {
    refreshDeploy();
    if (!deploy || deploy.status === 'completed') return;
    const t = setInterval(refreshDeploy, 10000);
    return () => clearInterval(t);
  }, [refreshDeploy, deploy?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const mediaUrl = useCallback(
    (path?: string) => {
      if (!path) return undefined;
      const p = pending.find((c) => c.path === `public${path}`);
      if (p && !('delete' in p) && p.encoding === 'base64') return `data:image/webp;base64,${p.content}`;
      // El panel se sirve desde el mismo sitio, así que los medios publicados están en la misma ruta.
      return path;
    },
    [pending],
  );

  const value = useMemo<AdminCtx>(
    () => ({
      store,
      checking,
      user,
      mode: store?.kind ?? (import.meta.env.DEV ? 'local' : 'github'),
      login,
      logout,
      useLocal,
      pending,
      stage,
      discard,
      publish,
      publishing,
      deploy,
      refreshDeploy,
      mediaUrl,
      api,
      version,
    }),
    [store, checking, user, login, logout, useLocal, pending, stage, discard, publish, publishing, deploy, refreshDeploy, mediaUrl, version],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdmin fuera de AdminProvider');
  return c;
}
