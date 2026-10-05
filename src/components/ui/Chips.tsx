import type { ReactNode } from 'react';
import styles from './Chips.module.scss';

export interface ChipOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Cantidad de resultados (se muestra en una pastilla chica al lado). */
  count?: number;
}

interface ChipGroupProps<T extends string> {
  /** Nombre accesible del grupo (p. ej. «Filtrar por categoría»). */
  label: string;
  /** Opción elegida; null = ninguna (se marca el chip «Todos», si hay). */
  value: T | null;
  onChange: (value: T | null) => void;
  options: ChipOption<T>[];
  /** Chip inicial que limpia el filtro («Todos», «Todas», «Todo»). */
  all?: { label: ReactNode; count?: number };
  align?: 'start' | 'center';
  className?: string;
}

/**
 * Filtros en píldora: botones con aria-pressed dentro de un role="group".
 * Tocar el chip activo lo apaga (vuelve a «Todos»).
 */
export default function ChipGroup<T extends string>({ label, value, onChange, options, all, align = 'start', className }: ChipGroupProps<T>) {
  return (
    <div className={[styles.group, styles[align], className].filter(Boolean).join(' ')} role="group" aria-label={label}>
      {all && <Chip pressed={value == null} onClick={() => onChange(null)} label={all.label} count={all.count} />}
      {options.map((o) => (
        <Chip key={o.value} pressed={value === o.value} onClick={() => onChange(value === o.value ? null : o.value)} label={o.label} count={o.count} />
      ))}
    </div>
  );
}

function Chip({ pressed, onClick, label, count }: { pressed: boolean; onClick: () => void; label: ReactNode; count?: number }) {
  return (
    <button type="button" className={styles.chip} aria-pressed={pressed} onClick={onClick}>
      {label}
      {count != null && <span className={styles.count}>{count}</span>}
    </button>
  );
}
