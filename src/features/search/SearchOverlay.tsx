import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import { ArrowRight, CornerDownLeft, Search, X } from 'lucide-react';
import { track } from '@/lib/analytics';
import { EASE_EMPHASIZED, EASE_EXIT } from '@/lib/motion';
import { useModalFocus } from '@/lib/useModalFocus';
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
  /** Consulta ya resuelta: los resultados cambian cuando se deja de escribir, no con cada letra. */
  const [settled, setSettled] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // El resto de la página queda inerte mientras está abierto; al cerrar, el foco vuelve a donde estaba
  useModalFocus(open, overlayRef);

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
        setSettled(q);
        setActive(0);
      }
    }, q.trim() ? 350 : 0);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [q]);

  // Se mide la búsqueda ya resuelta, con cuántos resultados dio (0 = algo que buscan y el sitio no tiene)
  useEffect(() => {
    const term = settled.trim();
    if (term.length < 3) return;
    const t = setTimeout(() => track('search', { search_term: term, resultados: hits.length }), 850);
    return () => clearTimeout(t);
  }, [settled, hits]);

  const terms = useMemo(() => settled.trim().split(/\s+/), [settled]);
  const pending = q.trim() !== settled.trim();
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

  // Entrada suave (fondo con fundido, panel que baja apenas) y salida más corta
  return (
    <AnimatePresence>
      {open && (
        <m.div
          ref={overlayRef}
          key="buscador"
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.35, ease: EASE_EMPHASIZED } }}
          exit={{ opacity: 0, transition: { duration: 0.22, ease: EASE_EXIT } }}
          role="dialog"
          aria-modal="true"
          aria-label="Buscar en el sitio"
          onKeyDown={onKeyDown}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <m.div
            className={styles.panel}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE_EMPHASIZED } }}
            exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.2, ease: EASE_EXIT } }}
          >
            <div className={styles.bar}>
              <Search className={styles.barIcon} size={26} aria-hidden />
              {/* Combobox: el foco queda en el campo y las flechas recorren los resultados (aria-activedescendant) */}
              <input
                ref={inputRef}
                className={styles.input}
                type="search"
                role="combobox"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="¿Qué estás buscando?"
                aria-label="Buscar en el sitio"
                aria-expanded={flat.length > 0}
                aria-autocomplete="list"
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

            {/* Siempre montado: el lector de pantalla anuncia cuántos resultados hay al dejar de escribir */}
            <p role="status" className="sr-only">
              {settled.trim() && !pending ? (flat.length ? `${hits.length} resultados para ${settled.trim()}` : `Sin resultados para ${settled.trim()}`) : ''}
            </p>

            <div className={[styles.results, pending && styles.pending].filter(Boolean).join(' ')} ref={listRef} aria-busy={pending}>
              {/* Primera búsqueda: esqueleto mientras llegan los resultados */}
              {pending && !settled.trim() && (
                <div className={styles.skeleton} aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <span key={i} />
                  ))}
                </div>
              )}

              {!q.trim() && !settled.trim() && (
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
                    {/* Navegan: son enlaces, no botones */}
                    <ul className={styles.quick} role="list">
                      {ACCESOS.map((a) => (
                        <li key={a.url}>
                          <Link to={a.url} onClick={onClose}>
                            {a.label} <ArrowRight size={18} aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {settled.trim() && !pending && !flat.length && (
                <p className={styles.none}>
                  No encontramos resultados para <strong>“{settled}”</strong>. Probá con otras palabras o escribinos por WhatsApp.
                </p>
              )}

              {/* Listbox solo con los resultados (agrupados por tipo); las opciones no van en el orden de Tab */}
              <div id="search-results" role="listbox" aria-label="Resultados">
              {settled.trim() && groups.map((g) => (
                <div key={g.type + settled} className={styles.group} role="group" aria-labelledby={`sg-${g.type}`}>
                  <p className={styles.groupTitle} id={`sg-${g.type}`}>
                    {TYPE_LABELS[g.type]}
                  </p>
                  <ul role="none">
                    {g.items.map((h) => {
                      idx += 1;
                      const i = idx;
                      return (
                        <li key={h.id} role="none">
                          <button
                            id={`sr-${h.id}`}
                            type="button"
                            role="option"
                            tabIndex={-1}
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
            </div>

            {settled.trim() && (
              <button
                type="button"
                className={styles.all}
                data-active={active === flat.length}
                onClick={() => go(`/buscar?q=${encodeURIComponent(q.trim())}`)}
              >
                Ver todos los resultados ({hits.length}) para “{settled.trim()}” <ArrowRight size={18} aria-hidden />
              </button>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
