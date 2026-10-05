import type { ElementType, ReactNode } from 'react';
import styles from './Section.module.scss';

export type Tone = 'default' | 'tint' | 'subtle' | 'dark' | 'brand' | 'ink';

interface SectionProps {
  id?: string;
  tone?: Tone;
  width?: 'prose' | 'default' | 'wide' | 'full';
  /** Imagen de fondo con overlay oscuro de marca (fuerza tono oscuro). Se carga en diferido. */
  image?: string;
  spacing?: 'sm' | 'md' | 'lg';
  as?: ElementType;
  className?: string;
  innerClassName?: string;
  labelledBy?: string;
  children: ReactNode;
}

/** Bloque de página estándar: fondo + padding vertical + contenedor centrado. */
export default function Section({
  id,
  tone = 'default',
  width = 'default',
  image,
  spacing = 'md',
  as: Tag = 'section',
  className,
  innerClassName,
  labelledBy,
  children,
}: SectionProps) {
  const dark = tone === 'dark' || tone === 'brand' || tone === 'ink' || Boolean(image);
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      // AmbientShapes ubica las formas de fondo solo sobre secciones claras
      data-surface={dark ? 'dark' : 'light'}
      className={[styles.section, styles[tone], image && styles.image, styles[`sp-${spacing}`], dark && 'on-dark', className]
        .filter(Boolean)
        .join(' ')}
    >
      {image && <img className={styles.bgImage} src={image} alt="" loading="lazy" decoding="async" />}
      <div className={[styles.inner, styles[`w-${width}`], innerClassName].filter(Boolean).join(' ')}>{children}</div>
    </Tag>
  );
}
