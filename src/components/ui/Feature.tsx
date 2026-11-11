import type { ReactNode } from 'react';
import SectionHeader from './SectionHeader';
import Reveal from './Reveal';
import Video from './Video';
import styles from './Feature.module.scss';

interface FeatureProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  image?: string;
  imageAlt?: string;
  /** Link de YouTube: si está, va el video en lugar de la foto. */
  video?: string;
  /** `cutout`: imagen recortada sin fondo (PNG/WebP con transparencia): se muestra entera, sin marco, y solo en escritorio. */
  imageFit?: 'photo' | 'cutout';
  reverse?: boolean;
  id?: string;
}

/** Bloque editorial texto + imagen (unifica los "Intro" de Home, Carrera y Especializaciones). */
export default function Feature({ eyebrow, title, children, actions, image, imageAlt = '', video, imageFit = 'photo', reverse, id }: FeatureProps) {
  return (
    <div
      id={id}
      className={[styles.feature, reverse && styles.reverse, !image && !video && styles.noImage, imageFit === 'cutout' && styles.cutout].filter(Boolean).join(' ')}
    >
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
      {video ? (
        <Reveal className={styles.mediaVideo} y={40}>
          <Video url={video} title={title} />
        </Reveal>
      ) : (
        image && (
          <Reveal className={styles.media} y={40}>
            <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
          </Reveal>
        )
      )}
    </div>
  );
}
