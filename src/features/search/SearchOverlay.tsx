import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { track } from '@/lib/analytics';
import { loadIndex, search, snippet, type Hit } from './engine';
import Highlight from './Highlight';
import { TYPE_LABELS, TYPE_ORDER } from './types';
import styles from './SearchOverlay.module.scss';

const POPULARES = ['Inscripciones', 'Plan de estudios', 'Horarios', 'Cuota', 'Neurociencias', 'Nutrición', 'Sedes', 'Mayores de 25'];
const ACCESOS = [
  { label: 'Cómo inscribirme', url: '/inscripciones' },
  { label: 'La carrera y el plan de estudios', url: '/carrera' },
  { label: 'Especializaciones gratuitas', url: '/especializaciones' },
  { label: 'Teléfonos y sedes', url: '/contacto' },
];

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    loadIndex();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    let cancel = false;
    const t = setTimeout(async () => {
      const r = await search(q);
      if (!cancel) {
        setHits(r);
        setActive(0);
      }
    }, 80);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    if (q.trim().length < 3) return;
    const t = setTimeout(() => track('search', { search_term: q.trim() }), 1200);
    return () => clearTimeout(t);
  }, [q]);

  const terms = useMemo(() => q.trim().split(/\s+/), [q]);
  const groups = useMemo(() => {
    const g = TYPE_ORDER.map((type) => ({ type, items: hits.filter((h) => h.type === type).slice(0, 4) })).filter((x) => x.items.length);
    return g;
  }, [hits]);
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const go = (url: string) => {
    onClose();
    setQ('');
    if (/^https?:/.test(url)) window.open(url, '_blank', 'noopener');
    else navigate(url);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(flat.length, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[active]) go(flat[active].url);
      else if (q.trim()) go(`/buscar?q=${encodeURIComponent(q.trim())}`);
    }
  };

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let idx = -1;

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en el sitio"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onKeyDown={onKeyDown}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <m.div
            className={styles.panel}
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.bar}>
              <Search className={styles.barIcon} size={26} aria-hidden />
              <input
                ref={inputRef}
                className={styles.input}
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="¿Qué estás buscando?"
                aria-label="Buscar en el sitio"
                aria-controls="search-results"
                aria-activedescendant={flat[active] ? `sr-${flat[active].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar buscador">
                <X size={22} />
                <kbd>Esc</kbd>
              </button>
            </div>

            <div className={styles.results} id="search-results" ref={listRef} role="listbox" aria-label="Resultados">
              {!q.trim() && (
                <div className={styles.empty}>
                  <div>
                    <p className={styles.groupTitle}>Búsquedas frecuentes</p>
                    <div className={styles.chips}>
                      {POPULARES.map((p) => (
                        <button key={p} type="button" className={styles.chip} onClick={() => setQ(p)}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={styles.groupTitle}>Accesos rápidos</p>
                    <ul className={styles.quick} role="list">
                      {ACCESOS.map((a) => (
                        <li key={a.url}>
                          <button type="button" onClick={() => go(a.url)}>
                            {a.label} <ArrowRight size={18} aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {q.trim() && !flat.length && (
                <p className={styles.none}>
                  No encontramos resultados para <strong>“{q}”</strong>. Probá con otras palabras o escribinos por WhatsApp.
                </p>
              )}

              {groups.map((g) => (
                <div key={g.type} className={styles.group}>
                  <p className={styles.groupTitle}>{TYPE_LABELS[g.type]}</p>
                  <ul role="list">
                    {g.items.map((h) => {
                      idx += 1;
                      const i = idx;
                      return (
                        <li key={h.id}>
                          <button
                            id={`sr-${h.id}`}
                            type="button"
                            role="option"
                            aria-selected={i === active}
                            data-active={i === active}
                            className={styles.hit}
                            onMouseMove={() => setActive(i)}
                            onClick={() => go(h.url)}
                          >
                            <span className={styles.hitTitle}>
                              <Highlight text={h.title} terms={terms} />
                            </span>
                            {h.context && <span className={styles.hitContext}>{h.context}</span>}
                            {h.text && h.type !== 'materia' && (
                              <span className={styles.hitText}>
                                <Highlight text={snippet(h.text, terms)} terms={terms} />
                              </span>
                            )}
                            <CornerDownLeft className={styles.enter} size={16} aria-hidden />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {q.trim() && (
              <button
                type="button"
                className={styles.all}
                data-active={active === flat.length}
                onClick={() => go(`/buscar?q=${encodeURIComponent(q.trim())}`)}
              >
                Ver todos los resultados ({hits.length}) para “{q.trim()}” <ArrowRight size={18} aria-hidden />
              </button>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
