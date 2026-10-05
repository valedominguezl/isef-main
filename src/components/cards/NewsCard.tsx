import { Link } from 'react-router';
import type { Novedad } from '@/content/schema';
import { NOVEDAD_CATEGORIAS } from '@/content/constants';
import type { WithSlug } from '@/content';
import { formatDate } from '@/lib/format';
import Badge from '../ui/Badge';
import styles from './NewsCard.module.scss';

export default function NewsCard({ novedad, variant = 'overlay', headingLevel = 3 }: { novedad: WithSlug<Novedad>; variant?: 'overlay' | 'plain'; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const;
  return (
    <article className={[styles.card, styles[variant], variant === 'overlay' && 'on-dark'].filter(Boolean).join(' ')}>
      {novedad.imagen && (
        <div className={styles.media}>
          <img src={novedad.imagen} alt="" loading="lazy" decoding="async" />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.meta}>
          <Badge tone={variant === 'overlay' ? 'light' : 'violet'}>{NOVEDAD_CATEGORIAS[novedad.categoria]}</Badge>
          <time dateTime={novedad.fecha}>{formatDate(novedad.fecha)}</time>
        </div>
        <H className={styles.title}>
          <Link to={`/novedades/${novedad.slug}`} className={styles.link}>
            {novedad.titulo}
          </Link>
        </H>
        <p className={styles.summary}>{novedad.resumen}</p>
        <span className={styles.more} aria-hidden>
          Leer más →
        </span>
      </div>
    </article>
  );
}
