import type { QuickToggle, CollectionConfig } from '../config';
import { getCollection } from '../config';
import { useAdmin } from '../AdminContext';
import { useEntries } from '../useEntries';

type Obj = Record<string, unknown>;

export interface LinkedQuick {
  toggles: QuickToggle[];
  data: Obj;
  titulo: string;
  onChange: (name: string, value: boolean) => void;
}

/**
 * Entradas sincronizadas (p. ej. una novedad de un curso): sus opciones básicas son las del curso.
 * Devuelve, para una entrada, los interruptores leídos del curso y un onChange que modifica el curso.
 */
export function useLinkedQuick(col: CollectionConfig | undefined) {
  const target = col?.syncWith ? getCollection(col.syncWith.collection) : undefined;
  const { entries } = useEntries(target?.dir);
  const { stage } = useAdmin();

  return (data: Obj): LinkedQuick | null => {
    if (!col?.syncWith || !target?.quick || !col.quick) return null;
    const slug = data[col.syncWith.field];
    const e = typeof slug === 'string' && slug ? entries?.find((x) => x.slug === slug) : undefined;
    if (!e) return null;
    const nombres = new Set(col.quick.map((q) => q.name));
    const titulo = String(e.data[target.titleField] ?? e.slug);
    return {
      // Mismos interruptores que la novedad, con los valores por defecto del curso
      toggles: target.quick.filter((q) => nombres.has(q.name)),
      data: e.data,
      titulo,
      onChange: (name, value) =>
        stage([{ path: e.path, content: `${JSON.stringify({ ...e.data, [name]: value }, null, 2)}\n`, encoding: 'utf8', label: titulo }]),
    };
  };
}
