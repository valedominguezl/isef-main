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
  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')}>
      <Search className={styles.icon} size={18} aria-hidden />
      <span className="sr-only">{label}</span>
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
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
    </label>
  );
}
