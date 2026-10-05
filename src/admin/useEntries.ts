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
/** Texto crudo de cada archivo: si al releer no cambió, se conserva el mismo objeto (no se pisa lo que se está editando). */
const rawCache = new Map<string, string | null>();
export const clearAdminCache = () => {
  cache.clear();
  rawCache.clear();
};

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

/**
 * Lee un archivo JSON. `data`: `undefined` = cargando · `null` = no existe (404) · objeto.
 * Un error de red NO se confunde con "no existe": se informa en `error` y se conserva lo que había.
 */
export function useFile(path: string | undefined) {
  const { store, pending, version } = useAdmin();
  const key = `file:${path}`;
  const [state, setState] = useState<{ key: string; data: Record<string, unknown> | null | undefined; error: string | null }>(() => ({
    key,
    data: cache.get(key) as Record<string, unknown> | null | undefined,
    error: null,
  }));
  useEffect(() => {
    if (!store || !path) return;
    let cancel = false;
    readWithPending(store, pending, path)
      .then((raw) => {
        if (cancel) return;
        // Sin cambios desde la última lectura: misma referencia, los editores no se reinician
        if (rawCache.has(key) && rawCache.get(key) === raw && cache.has(key)) {
          setState((s) => (s.key === key && !s.error ? s : { key, data: cache.get(key) as Record<string, unknown> | null, error: null }));
          return;
        }
        const data = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
        rawCache.set(key, raw);
        cache.set(key, data);
        setState({ key, data, error: null });
      })
      .catch((e: Error) => {
        if (!cancel) setState((s) => ({ key, data: s.key === key ? s.data : (cache.get(key) as Record<string, unknown> | null | undefined), error: e.message }));
      });
    return () => {
      cancel = true;
    };
  }, [store, path, version]); // eslint-disable-line react-hooks/exhaustive-deps
  return state.key === key ? state : { key, data: cache.get(key) as Record<string, unknown> | null | undefined, error: null };
}
