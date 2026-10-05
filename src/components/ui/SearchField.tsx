import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import IconButton from './IconButton';
import styles from './SearchField.module.scss';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  /** Mientras se escribe (antes de que se apliquen los resultados): muestra un indicador sutil. */
  pending?: boolean;
  className?: string;
}

/** Campo de búsqueda único del sitio (FAQ, especializaciones, conferencias). Combinar con useDebounced. */
export default function SearchField({ value, onChange, placeholder, label, pending, className }: Props) {
  const input = useRef<HTMLInputElement>(null);
  return (
    // Contenedor (no <label>): así el botón de borrar no se suma al nombre del campo. Un clic en cualquier parte enfoca el campo.
    <div className={[styles.field, className].filter(Boolean).join(' ')} onClick={(e) => e.target === e.currentTarget && input.current?.focus()}>
      <Search className={styles.icon} size={18} aria-hidden />
      <input ref={input} type="search" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      <span className={[styles.dots, pending && styles.dotsOn].filter(Boolean).join(' ')} aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {value && (
        <IconButton label="Borrar búsqueda" size="sm" onClick={() => onChange('')}>
          <X size={16} />
        </IconButton>
      )}
    </div>
  );
}
