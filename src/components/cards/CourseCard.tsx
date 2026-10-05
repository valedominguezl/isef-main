import { Link } from 'react-router';
import { ArrowRight, CalendarDays } from 'lucide-react';
import type { Curso } from '@/content/schema';
import { esProximo, etiquetasCurso, type WithSlug } from '@/content';
import { formatDate } from '@/lib/format';
import { track } from '@/lib/analytics';
import Badge from '../ui/Badge';
import styles from './CourseCard.module.scss';

interface Props {
  curso: WithSlug<Curso>;
  headingLevel?: 2 | 3;
  size?: 'md' | 'lg';
}

/** Tarjeta de especialización: imagen con overlay de marca y CTA. Toda la tarjeta es un enlace. */
export default function CourseCard({ curso, headingLevel = 3, size = 'md' }: Props) {
  const H = `h${headingLevel}` as const;
  return (
    <article className={[styles.card, styles[size], 'on-dark'].join(' ')}>
      {curso.imagen && <img className={styles.img} src={curso.imagen} alt="" loading="lazy" decoding="async" />}
      <div className={styles.top}>
        {etiquetasCurso(curso).map((e) => (
            <Badge key={e.texto} tone={e.tono}>
              {e.texto}
            </Badge>
          ))}
        {curso.modalidad && <Badge tone="light">{curso.modalidad}</Badge>}
      </div>
      <div className={styles.content}>
        <H className={styles.title}>
          <Link
            to={`/especializaciones/${curso.slug}`}
            className={styles.link}
            onClick={() => track('curso_ver_mas', { curso: curso.titulo })}
          >
            {curso.titulo}
          </Link>
        </H>
        <p className={styles.subtitle}>{curso.subtitulo}</p>
        <div className={styles.footer}>
          {esProximo(curso) ? (
            <span className={styles.date}>
              <CalendarDays size={16} aria-hidden /> Inicia el {formatDate(curso.fechaInicio)}
            </span>
          ) : (
            <span />
          )}
          <span className={styles.cta} aria-hidden>
            Ver más <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </article>
  );
}
