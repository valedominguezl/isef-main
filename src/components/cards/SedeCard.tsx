import type { ReactNode } from 'react';
import { Clock, MapPin, Navigation } from 'lucide-react';
import { sitio } from '@/content';
import { formatPhone, whatsappUrl } from '@/lib/format';
import { FacebookIcon, WhatsAppIcon } from '../ui/Icons';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import styles from './SedeCard.module.scss';

type Sede = (typeof sitio.sedes)[number];

interface Props {
  sede: Sede;
  /** Contenido arriba de los datos (p. ej. el mapa en Contacto). */
  media?: ReactNode;
  headingLevel?: 2 | 3;
}

/** Tarjeta de sede (Home y Contacto): nombre, datos con ícono, "Cómo llegar" y redes de la sede. */
export default function SedeCard({ sede, media, headingLevel = 3 }: Props) {
  const H = `h${headingLevel}` as const;
  return (
    <article className={styles.card}>
      {media}
      <div className={styles.body}>
        <header className={styles.head}>
          <span className={styles.pin} aria-hidden>
            <MapPin />
          </span>
          <div>
            <p className={styles.tipo}>{sede.tipo}</p>
            <H className={styles.nombre}>{sede.nombre}</H>
          </div>
        </header>

        <ul role="list" className={styles.list}>
          <li>
            <MapPin aria-hidden />
            <span>{sede.direccion}</span>
          </li>
          <li>
            <WhatsAppIcon aria-hidden />
            <a href={whatsappUrl(sede.telefono)} target="_blank" rel="noopener noreferrer">
              {formatPhone(sede.telefono)}
            </a>
          </li>
          <li>
            <Clock aria-hidden />
            <span>{sede.horario}</span>
          </li>
        </ul>

        <div className={styles.actions}>
          <Button href={sede.mapaUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm" icon="none" leading={<Navigation size={16} aria-hidden />}>
            Cómo llegar
          </Button>
          {sede.facebook && (
            <IconButton href={sede.facebook} target="_blank" rel="noopener noreferrer" label={`Facebook de la sede ${sede.nombre}`} size="sm" variant="outline" tone="brand">
              <FacebookIcon size={18} />
            </IconButton>
          )}
        </div>
      </div>
    </article>
  );
}
