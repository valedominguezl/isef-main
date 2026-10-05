import { CalendarCheck, Eye, EyeOff, GraduationCap, Star, type LucideIcon } from 'lucide-react';
import type { QuickToggle } from '../config';
import styles from '../Admin.module.scss';

type Obj = Record<string, unknown>;

const ICONS: Record<QuickToggle['icon'], LucideIcon> = { eye: Eye, star: Star, calendar: CalendarCheck, graduation: GraduationCap };

export const quickValue = (q: QuickToggle, data: Obj) => (typeof data[q.name] === 'boolean' ? (data[q.name] as boolean) : q.fallback);

/**
 * Opciones básicas de una entrada (visible, destacado, este año…) como botones con ícono.
 * `compact`: solo íconos (filas de la lista); si no, ícono + texto (arriba del editor).
 */
export default function QuickToggles({ toggles, data, onChange, compact }: { toggles: QuickToggle[]; data: Obj; onChange: (name: string, value: boolean) => void; compact?: boolean }) {
  return (
    <div className={compact ? styles.quickCompact : styles.quickBar} role="group" aria-label="Opciones básicas">
      {toggles.map((q) => {
        const on = quickValue(q, data);
        const Icon = q.icon === 'eye' && !on ? EyeOff : ICONS[q.icon];
        const label = on ? q.on : q.off;
        return (
          <button
            key={q.name}
            type="button"
            className={[styles.quick, on && styles.quickOn].filter(Boolean).join(' ')}
            aria-pressed={on}
            title={`${label}. ${q.help}`}
            aria-label={compact ? `${q.on}: ${on ? 'sí' : 'no'}` : undefined}
            onClick={(e) => {
              // En la lista la fila es un link: el botón no debe abrir la entrada
              e.preventDefault();
              e.stopPropagation();
              onChange(q.name, !on);
            }}
          >
            <Icon size={compact ? 16 : 18} fill={q.icon === 'star' && on ? 'currentColor' : 'none'} aria-hidden />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
