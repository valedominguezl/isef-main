import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.scss';

export interface AccordionItem {
  id?: string;
  title: ReactNode;
  meta?: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  variant?: 'card' | 'brand' | 'plain';
  /** Permite varios abiertos a la vez. */
  multiple?: boolean;
  defaultOpen?: number[];
  headingLevel?: 3 | 4;
  className?: string;
}

/** Acordeón accesible (botón con aria-expanded + región) con animación de altura. */
export default function Accordion({ items, variant = 'card', multiple = true, defaultOpen = [], headingLevel = 3, className }: AccordionProps) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(defaultOpen));
  const uid = useId();
  const H = `h${headingLevel}` as const;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : []);
      if (prev.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className={[styles.accordion, styles[variant], className].filter(Boolean).join(' ')}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const btnId = `${uid}-b${i}`;
        const panelId = `${uid}-p${i}`;
        return (
          <div key={item.id ?? i} id={item.id} className={[styles.item, isOpen && styles.open].filter(Boolean).join(' ')}>
            <H className={styles.heading}>
              <button id={btnId} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(i)} className={styles.trigger}>
                <span className={styles.titleWrap}>
                  <span className={styles.title}>{item.title}</span>
                  {item.meta && <span className={styles.meta}>{item.meta}</span>}
                </span>
                <span className={styles.chevron} aria-hidden>
                  <ChevronDown size={20} />
                </span>
              </button>
            </H>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={styles.panel}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                >
                  <div className={styles.body}>{item.content}</div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
