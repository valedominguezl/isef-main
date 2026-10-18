import { m, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';
import { DURATION, EASE_EMPHASIZED } from '@/lib/motion';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  /** Desplazamiento inicial en px. */
  y?: number;
  as?: 'div' | 'li' | 'article' | 'section' | 'header';
}

/** Curva suave del sitio original (sin arranque brusco). Entradas lentas: es una web institucional, no una herramienta. */
const ease = EASE_EMPHASIZED;
const duration = DURATION.reveal;

/**
 * Con «reducir movimiento», el desplazamiento es instantáneo y queda solo el fundido.
 * (<MotionConfig reducedMotion="user"> anula x/y, pero no un `transform` escrito como texto,
 * que usamos para que la animación vaya por la GPU.)
 */
function useTransition(delay = 0) {
  const reduce = useReducedMotion();
  return { duration, ease, delay, ...(reduce && { transform: { duration: 0, delay } }) };
}

/** Aparición al entrar en pantalla (reemplaza los ~20 IntersectionObserver duplicados). */
export default function Reveal({ children, delay = 0, y = 24, as = 'div', ...rest }: RevealProps) {
  const Comp = m[as] as typeof m.div;
  const transition = useTransition(delay);
  return (
    <Comp
      initial={{ opacity: 0, transform: `translateY(${y}px)` }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={transition}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Contenedor que escalona la aparición de sus hijos <RevealItem>. */
export function RevealGroup({ children, className, stagger = 0.12, as = 'div' }: { children: ReactNode; className?: string; stagger?: number; as?: 'div' | 'ul' | 'ol' }) {
  const Comp = m[as] as typeof m.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({ children, className, as = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'article' }) {
  const Comp = m[as] as typeof m.div;
  const transition = useTransition();
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, transform: 'translateY(24px)' },
        show: { opacity: 1, transform: 'translateY(0px)', transition },
      }}
    >
      {children}
    </Comp>
  );
}
