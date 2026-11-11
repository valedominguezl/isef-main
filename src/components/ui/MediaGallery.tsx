import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Play } from 'lucide-react';
import { youtubeEmbed, youtubeId, youtubeThumb } from '@/lib/youtube';
import Carousel from './Carousel';
import Dialog from './Dialog';
import IconButton from './IconButton';
import Video from './Video';
import styles from './MediaGallery.module.scss';

/** Una foto o un video de YouTube (sin foto, se usa la miniatura del video). */
export interface MediaItem {
  imagen?: string;
  video?: string;
  /** Leyenda (y texto alternativo de la foto). */
  titulo?: string;
  credito?: string;
}

interface MediaGalleryProps {
  items: MediaItem[];
  /** Nombre del carrusel para lectores de pantalla; también la leyenda de lo que no tiene título. */
  label: string;
  /** `doble`: 2 por vista desde tablet (secciones anchas). `simple`: 1 por vista (columnas de texto). */
  columnas?: 'doble' | 'simple';
}

/**
 * Fotos y videos: con varios, carrusel + visor a pantalla completa (el video se reproduce en el visor);
 * con uno solo, la foto (se amplía al tocarla) o el video, sin carrusel.
 */
export default function MediaGallery({ items, label, columnas = 'doble' }: MediaGalleryProps) {
  const lista = items
    .map((g) => {
      const video = youtubeId(g.video);
      return { ...g, video, leyenda: g.titulo, titulo: g.titulo || label, src: g.imagen ?? (video ? youtubeThumb(video) : '') };
    })
    .filter((g) => g.src);

  const [index, setIndex] = useState<number | null>(null);
  // Último elemento abierto: el visor lo sigue mostrando mientras se cierra con su animación de salida
  const [last, setLast] = useState(0);
  if (index != null && index !== last) setLast(index);
  // Sentido del último paso: lo nuevo entra desde el lado hacia el que se avanza
  const [dir, setDir] = useState(1);
  const current = lista[index ?? last];
  const varios = lista.length > 1;
  const step = (d: number) => {
    setDir(d);
    setIndex((i) => (i == null ? i : (i + d + lista.length) % lista.length));
  };
  // Flechas del teclado mientras el visor está abierto
  const abierto = index != null;
  useEffect(() => {
    if (!abierto || !varios) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- step solo usa setters estables
  }, [abierto, varios]);

  if (!lista.length) return null;
  // Un solo video: se reproduce ahí mismo
  if (!varios && lista[0].video) return <Video url={`https://youtu.be/${lista[0].video}`} title={lista[0].titulo} />;

  const tarjetas = lista.map((g, i) => (
    <figure key={g.src} className={styles.photo}>
      <button type="button" className={g.video ? styles.esVideo : undefined} onClick={() => setIndex(i)} aria-label={`${g.video ? 'Ver video' : 'Ampliar foto'}: ${g.titulo}`}>
        <img src={g.src} alt={g.titulo} loading="lazy" decoding="async" className={g.imagen ? undefined : styles.ytThumb} />
        {g.video ? <Play className={styles.zoom} size={20} fill="currentColor" aria-hidden /> : <Maximize2 className={styles.zoom} size={20} aria-hidden />}
      </button>
      {(g.leyenda || g.credito) && (
        <figcaption className="on-dark">
          {g.leyenda && <strong>{g.leyenda}</strong>}
          {g.credito && <small>{g.credito}</small>}
        </figcaption>
      )}
    </figure>
  ));

  return (
    <>
      {varios ? (
        <Carousel label={label} className={styles[columnas]} standardWidth={false}>
          {tarjetas}
        </Carousel>
      ) : (
        tarjetas[0]
      )}
      {/* Pantalla completa: la foto o el video lo más grande posible */}
      <Dialog open={index != null} onClose={() => setIndex(null)} title={current?.titulo ?? label} hideTitle size="full" variant="dark">
        {current && (
          <div className={styles.lightbox}>
            {/* Marco 3:2 fijo y la foto recortada (cover): todas se ven con el mismo formato y el visor no cambia de tamaño */}
            <div className={styles.frame}>
              {current.video ? (
                <iframe
                  key={current.video}
                  className={styles.swap}
                  src={youtubeEmbed(current.video)}
                  title={current.titulo}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  style={{ '--dir': dir } as React.CSSProperties}
                />
              ) : (
                <img key={current.src} className={styles.swap} src={current.src} alt={current.titulo} style={{ '--dir': dir } as React.CSSProperties} />
              )}
            </div>
            <div className={`${styles.lightboxBar} on-dark`}>
              {varios && (
                <IconButton label="Anterior" tone="light" onClick={() => step(-1)}>
                  <ChevronLeft />
                </IconButton>
              )}
              <p>
                <strong>{current.titulo}</strong>
                {current.credito && <small> · {current.credito}</small>}
                {varios && (
                  <span>
                    {(index ?? last) + 1} / {lista.length}
                  </span>
                )}
              </p>
              {varios && (
                <IconButton label="Siguiente" tone="light" onClick={() => step(1)}>
                  <ChevronRight />
                </IconButton>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
