import type { ReactNode } from 'react';
import { RevealGroup } from './Reveal';
import styles from './CardGrid.module.scss';

interface CardGridProps {
  children: ReactNode;
  /** Máximo de columnas. Normal: 2 → 2 desde md · 3 → 2 desde md y 3 desde xl · 4 → 2 sm, 3 lg, 4 xl. */
  cols?: 2 | 3 | 4;
  /** Tarjetas chicas (disertantes, datos): llegan antes al máximo (3 → 2 desde sm y 3 desde lg). */
  dense?: boolean;
  /** Entrada escalonada al aparecer en pantalla (los hijos deben ser <RevealItem>). */
  reveal?: boolean;
  as?: 'div' | 'ul' | 'ol';
  role?: string;
  className?: string;
}

/**
 * Grilla de tarjetas del sitio: 1 columna en móvil y crece hasta `cols`.
 * Cada celda estira a su tarjeta para que las de una misma fila midan lo mismo.
 * Para grillas asimétricas (1.3fr 1fr, barra lateral, filas etiqueta/valor) usar CSS propio.
 */
export default function CardGrid({ children, cols = 3, dense, reveal, as = 'div', role, className }: CardGridProps) {
  const cls = [styles.grid, styles[`cols${cols}`], dense && styles.dense, className].filter(Boolean).join(' ');
  if (reveal) {
    return (
      <RevealGroup as={as} className={cls}>
        {children}
      </RevealGroup>
    );
  }
  const Comp = as;
  return (
    <Comp className={cls} role={role}>
      {children}
    </Comp>
  );
}
