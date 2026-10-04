import type { ReactNode } from 'react';
import { rich } from '@/lib/markdown';
import Reveal from './Reveal';
import styles from './SectionHeader.module.scss';

interface SectionHeaderProps {
  eyebrow?: string;
  /** Admite énfasis: "Las *últimas noticias*" */
  title: string;
  lead?: ReactNode;
  align?: 'start' | 'center';
  level?: 1 | 2 | 3;
  id?: string;
  divider?: boolean;
  className?: string;
  children?: ReactNode;
}

/** Encabezado estándar de sección: antetítulo + título con énfasis + línea + bajada. */
export default function SectionHeader({
  eyebrow,
  title,
  lead,
  align = 'start',
  level = 2,
  id,
  divider = true,
  className,
  children,
}: SectionHeaderProps) {
  const H = `h${level}` as const;
  return (
    <Reveal className={[styles.header, styles[align], className].filter(Boolean).join(' ')}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <H id={id} className={styles.title}>
        {rich(title)}
      </H>
      {divider && <span className={styles.divider} aria-hidden />}
      {lead && (typeof lead === 'string' ? <p className={styles.lead}>{lead}</p> : <div className={styles.lead}>{lead}</div>)}
      {children}
    </Reveal>
  );
}
