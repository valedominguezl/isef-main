import type { ReactNode } from 'react';
import SectionHeader from './SectionHeader';
import Reveal from './Reveal';
import styles from './Feature.module.scss';

interface FeatureProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  image?: string;
  imageAlt?: string;
  reverse?: boolean;
  id?: string;
}

/** Bloque editorial texto + imagen (unifica los "Intro" de Home, Carrera y Especializaciones). */
export default function Feature({ eyebrow, title, children, actions, image, imageAlt = '', reverse, id }: FeatureProps) {
  return (
    <div id={id} className={[styles.feature, reverse && styles.reverse, !image && styles.noImage].filter(Boolean).join(' ')}>
      <div className={styles.text}>
        <SectionHeader eyebrow={eyebrow} title={title} className={styles.header} />
        <Reveal delay={0.1} className={styles.body}>
          {children}
        </Reveal>
        {actions && (
          <Reveal delay={0.2} className={styles.actions}>
            {actions}
          </Reveal>
        )}
      </div>
      {image && (
        <Reveal className={styles.media} y={40}>
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
        </Reveal>
      )}
    </div>
  );
}
