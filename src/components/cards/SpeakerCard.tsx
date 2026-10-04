import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Disertante } from '@/content/schema';
import { nombreCompleto, type WithSlug } from '@/content';
import styles from './SpeakerCard.module.scss';

export default function SpeakerCard({ disertante, headingLevel = 3 }: { disertante: WithSlug<Disertante>; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as const;
  const nombre = nombreCompleto(disertante);
  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        {disertante.foto && <img src={disertante.foto} alt={`Retrato de ${nombre}`} loading="lazy" decoding="async" width={320} height={320} />}
      </div>
      <div className={styles.body}>
        <p className={styles.area}>{disertante.especialidad}</p>
        <H className={styles.name}>
          <Link to={`/disertantes/${disertante.slug}`} className={styles.link}>
            {nombre}
          </Link>
        </H>
        <ul className={styles.list} role="list">
          {disertante.destacados.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <span className={styles.cta} aria-hidden>
          Ver currículum <ArrowRight size={16} />
        </span>
      </div>
    </article>
  );
}
