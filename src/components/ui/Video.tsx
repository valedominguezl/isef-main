import { useState } from 'react';
import { Play } from 'lucide-react';
import { youtubeEmbed, youtubeId, youtubeThumb } from '@/lib/youtube';
import styles from './Video.module.scss';

interface VideoProps {
  /** Link de YouTube tal como se copia del navegador o del botón «Compartir». */
  url: string;
  /** Nombre del video: para lectores de pantalla y como leyenda sobre la miniatura. */
  title: string;
  className?: string;
}

/**
 * Video de YouTube liviano: primero muestra la miniatura con un botón de play y recién al tocarlo
 * carga el reproductor (youtube-nocookie). Así la página no carga ~1 MB de YouTube por cada video
 * ni deja cookies de terceros a quien no lo mira.
 */
export default function Video({ url, title, className }: VideoProps) {
  const id = youtubeId(url);
  const [playing, setPlaying] = useState(false);
  if (!id) return null;

  return (
    <div className={[styles.video, className].filter(Boolean).join(' ')}>
      {playing ? (
        <iframe
          src={youtubeEmbed(id)}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" className={styles.facade} onClick={() => setPlaying(true)} aria-label={`Reproducir video: ${title}`}>
          <img src={youtubeThumb(id)} alt="" loading="lazy" decoding="async" />
          <span className={styles.play} aria-hidden>
            <Play size={28} fill="currentColor" />
          </span>
          <span className={`${styles.caption} on-dark`}>{title}</span>
        </button>
      )}
    </div>
  );
}
