import type { ReactNode } from 'react';
import { rich } from '@/lib/markdown';
import Breadcrumbs, { type Crumb } from './Breadcrumbs';
import styles from './PageHero.module.scss';

interface PageHeroProps {
  title: string;
  subtitle?: ReactNode;
  eyebrow?: string;
  image?: string;
  /** Versión de ~800 px para pantallas chicas (mejora el LCP en móvil). */
  imageSmall?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  size?: 'md' | 'lg' | 'full';
  align?: 'center' | 'start';
  children?: ReactNode;
}

/** Cabecera de página con imagen + overlay de marca. Es el primer bloque de cada ruta. */
export default function PageHero({ title, subtitle, eyebrow, image, imageSmall, breadcrumbs, actions, size = 'md', align = 'center', children }: PageHeroProps) {
  return (
    <header
      className={['on-dark', styles.hero, styles[size], styles[align], !image && styles.noImage].filter(Boolean).join(' ')}
    >
      {image && (
        <img
          className={styles.bg}
          src={image}
          srcSet={imageSmall ? `${imageSmall} 800w, ${image} 1920w` : undefined}
          sizes={imageSmall ? '100vw' : undefined}
          alt=""
          {...{ fetchpriority: 'high' }}
          decoding="async"
        />
      )}
      <div className={styles.inner}>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} light />}
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{rich(title)}</h1>
        {subtitle && <span className={styles.line} aria-hidden />}
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
        {children}
      </div>
    </header>
  );
}
