import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import styles from './CountUp.module.scss';

const fmt = new Intl.NumberFormat('es-AR');
// Cúbica: sube pareja y frena al final (la expo llegaba casi al valor en medio segundo)
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Número que cuenta hasta `to` cuando entra en pantalla. El HTML prerenderizado muestra el valor final. */
export default function CountUp({
  to,
  prefix = '',
  duration = 3.5,
  delay = 0,
}: {
  to: number;
  prefix?: string;
  duration?: number;
  /** Segundos de espera antes de empezar a contar (para escalonar varios números). */
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const start = performance.now() + delay * 1000;
    setValue(0);
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / (duration * 1000)));
      setValue(Math.round(to * easeOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, delay, reduced]);

  const final = `${prefix}${fmt.format(to)}`;
  return (
    <span ref={ref}>
      <span className="sr-only">{final}</span>
      <span className={styles.root} aria-hidden>
        <span className={styles.ghost}>{final}</span>
        <span className={styles.live}>
          {prefix}
          {fmt.format(value)}
        </span>
      </span>
    </span>
  );
}
