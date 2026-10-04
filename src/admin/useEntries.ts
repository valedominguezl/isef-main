import { useEffect, useState } from 'react';
import { useAdmin } from './AdminContext';
import { listWithPending, readWithPending } from './store';

export interface Entry {
  slug: string;
  path: string;
  data: Record<string, unknown>;
}

/** Lista y lee todas las entradas de una carpeta (aplicando cambios pendientes). */
export function useEntries(dir: string | undefined) {
  const { store, pending, version } = useAdmin();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        if (!cancel) setEntries(out);
      } catch (e) {
        if (!cancel) setError((e as Error).message);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [store, dir, version]); // eslint-disable-line react-hooks/exhaustive-deps

  return { entries, error };
}

export function useFile(path: string | undefined) {
  const { store, pending, version } = useAdmin();
  const [data, setData] = useState<Record<string, unknown> | null | undefined>(undefined);
  useEffect(() => {
    if (!store || !path) return;
    let cancel = false;
    readWithPending(store, pending, path).then((raw) => {
      if (!cancel) setData(raw ? (JSON.parse(raw) as Record<string, unknown>) : null);
    });
    return () => {
      cancel = true;
    };
  }, [store, path, version]); // eslint-disable-line react-hooks/exhaustive-deps
  return data;
}
