import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import styles from './Breadcrumbs.module.scss';

export interface Crumb {
  name: string;
  path?: string;
}

export default function Breadcrumbs({ items, light }: { items: Crumb[]; light?: boolean }) {
  return (
    <nav aria-label="Ruta de navegación" className={[styles.nav, light && styles.light].filter(Boolean).join(' ')}>
      <ol role="list">
        {items.map((c, i) => (
          <li key={i}>
            {c.path && i < items.length - 1 ? <Link to={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}
            {i < items.length - 1 && <ChevronRight size={14} aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
