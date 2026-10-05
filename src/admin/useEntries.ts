import { useEffect, useState } from 'react';
import { useAdmin } from './AdminContext';
import { listWithPending, readWithPending } from './store';

export interface Entry {
  slug: string;
  path: string;
  data: Record<string, unknown>;
}

/**
 * Caché en memoria por ruta: al volver a una vista ya visitada se muestra al instante
 * y se actualiza por detrás (sin pantallas vacías entre vistas).
 */
const cache = new Map<string, unknown>();
export const clearAdminCache = () => cache.clear();

/** Lista y lee todas las entradas de una carpeta (aplicando cambios pendientes). */
export function useEntries(dir: string | undefined) {
  const { store, pending, version } = useAdmin();
  const key = `dir:${dir}`;
  const [state, setState] = useState<{ key: string; entries: Entry[] | null; error: string | null }>(() => ({
    key,
    entries: (cache.get(key) as Entry[] | undefined) ?? null,
    error: null,
  }));

  useEffect(() => {
    if (!store || !dir) return;
    let cancel = false;
    (async () => {
      try {
        const files = (await listWithPending(store, pending, dir)).filter((f) => f.name.endsWith('.json'));
        const out = await Promise.all(
          files.map(async (f) => {
            const raw = await readWithPending(store, pending, f.path);
            return { slug: f.name.replace(/\.json$/, ''), path: f.path, data: raw ? (JSON.parse(raw) as Record<string, unknown>) : {} };
          }),
        );
        cache.set(key, out);
        if (!cancel) setState({ key, entries: out, error: null });
      } catch (e) {
        if (!cancel) setState((s) => ({ key, entries: s.key === key ? s.entries : null, error: (e as Error).message }));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [store, dir, version]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si cambió la carpeta, no mostrar las entradas de la anterior: usar la caché de la nueva (o nada)
  const current = state.key === key ? state : { entries: (cache.get(key) as Entry[] | undefined) ?? null, error: null };
  return { entries: current.entries, error: current.error };
}

/** Lee un archivo JSON. `undefined` = cargando · `null` = no existe · `{error}` en el segundo valor si falló. */
export function useFile(path: string | undefined) {
  const { store, pending, version } = useAdmin();
  const key = `file:${path}`;
  const [state, setState] = useState<{ key: string; data: Record<string, unknown> | null | undefined }>(() => ({
    key,
    data: cache.get(key) as Record<string, unknown> | null | undefined,
  }));
  useEffect(() => {
    if (!store || !path) return;
    let cancel = false;
    readWithPending(store, pending, path)
      .then((raw) => {
        const data = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
        cache.set(key, data);
        if (!cancel) setState({ key, data });
      })
      .catch(() => {
        if (!cancel) setState({ key, data: null });
      });
    return () => {
      cancel = true;
    };
  }, [store, path, version]); // eslint-disable-line react-hooks/exhaustive-deps
  return state.key === key ? state.data : (cache.get(key) as Record<string, unknown> | null | undefined);
}
