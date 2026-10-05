import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconButton from './IconButton';
import styles from './Carousel.module.scss';

interface CarouselProps {
  children: ReactNode;
  label: string;
  /** Ancho de cada slide (CSS). Por defecto se adapta por breakpoint. */
  slideWidth?: string;
  gap?: string;
  showDots?: boolean;
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * Carrusel liviano con scroll-snap nativo (sin Swiper): táctil, con teclado,
 * botones y puntos. Funciona sin JS (scroll horizontal) y no bloquea el render.
 */
export default function Carousel({ children, label, slideWidth, gap, showDots = true, tone = 'light', className }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slides = Children.toArray(children);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const left = el.scrollLeft;
    let idx = 0;
    let best = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft - el.offsetLeft - left);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    setActive(idx);
    setEdges({ start: left < 8, end: left + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, slides.length]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    const item = el?.children[i] as HTMLElement | undefined;
    if (el && item) el.scrollTo({ left: item.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  const step = (dir: 1 | -1) => goTo(Math.max(0, Math.min(slides.length - 1, active + dir)));

  return (
    <div
      className={[styles.carousel, styles[tone], className].filter(Boolean).join(' ')}
      role="region"
      aria-roledescription="carrusel"
      aria-label={label}
      style={{ ...(slideWidth ? { '--slide-w': slideWidth } : {}), ...(gap ? { '--slide-gap': gap } : {}) } as React.CSSProperties}
    >
      <div
        ref={trackRef}
        className={styles.track}
        onScroll={update}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            step(1);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        {slides.map((child, i) => (
          <div key={i} className={styles.slide} role="group" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${slides.length}`}>
            {child}
          </div>
        ))}
      </div>

      {/* Sin controles si todas las diapositivas entran a la vista */}
      {slides.length > 1 && !(edges.start && edges.end) && (
        <div className={styles.controls}>
          {showDots && (
            <div className={styles.dots}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={[styles.dot, i === active && styles.dotActive].filter(Boolean).join(' ')}
                  aria-label={`Ir a la diapositiva ${i + 1}`}
                  aria-current={i === active}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          )}
          <div className={styles.arrows}>
            <IconButton label="Anterior" variant="outline" tone={tone === 'dark' ? 'light' : 'default'} onClick={() => step(-1)} disabled={edges.start}>
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton label="Siguiente" variant="outline" tone={tone === 'dark' ? 'light' : 'default'} onClick={() => step(1)} disabled={edges.end}>
              <ChevronRight size={20} />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
