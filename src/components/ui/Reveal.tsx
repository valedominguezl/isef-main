import { m, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  /** Desplazamiento inicial en px. */
  y?: number;
  as?: 'div' | 'li' | 'article' | 'section' | 'header';
}

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Aparición al entrar en pantalla (reemplaza los ~20 IntersectionObserver duplicados).
 * Respeta "reducir movimiento" vía <MotionConfig reducedMotion="user"> en App.
 */
export default function Reveal({ children, delay = 0, y = 24, as = 'div', ...rest }: RevealProps) {
  const Comp = m[as] as typeof m.div;
  return (
    <Comp
      initial={{ opacity: 0, transform: `translateY(${y}px)` }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, ease, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Contenedor que escalona la aparición de sus hijos <RevealItem>. */
export function RevealGroup({ children, className, stagger = 0.08, as = 'div' }: { children: ReactNode; className?: string; stagger?: number; as?: 'div' | 'ul' | 'ol' }) {
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
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, transform: 'translateY(24px)' },
        show: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.6, ease } },
      }}
    >
      {children}
    </Comp>
  );
}
