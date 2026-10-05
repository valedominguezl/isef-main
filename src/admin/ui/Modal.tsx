import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'motion/react';
import { X, type LucideIcon } from 'lucide-react';
import { IconButton } from './Button';
import styles from './Ui.module.scss';

const EASE_IN = [0.25, 0.46, 0.45, 0.94] as const;
const EASE_OUT = [0.4, 0, 1, 1] as const;
const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  /** Botones de abajo (Cancelar / acción principal). */
  actions?: ReactNode;
  /** Más ancho (p. ej. una grilla de fotos). */
  wide?: boolean;
  /** Elemento que recibe el foco al abrir (si no, el primero que se pueda enfocar). */
  initialFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/** Diálogo con contenido propio (formularios, buscadores). Escape o clic afuera lo cierran; el foco no se escapa. */
export default function Modal(props: ModalProps) {
  if (typeof document === 'undefined') return null;
  return createPortal(<AnimatePresence>{props.open && <Panel key="modal" {...props} />}</AnimatePresence>, document.body);
}

function Panel({ onClose, title, icon: Icon, actions, wide, initialFocus, children }: ModalProps) {
  const titleId = useId();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = box.current;
    (initialFocus?.current ?? box.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    // La página de atrás no se desplaza mientras el diálogo está abierto
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      const a = document.activeElement;
      if (!a || a === document.body || el?.contains(a)) prev?.focus?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !box.current) return;
    const f = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <m.div
      className={styles.backdrop}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.35, ease: EASE_IN } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
    >
      <m.div
        ref={box}
        className={[styles.modal, wide && styles.modalWide].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: EASE_IN } }}
        exit={{ opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.2, ease: EASE_OUT } }}
      >
        <header className={styles.modalHead}>
          {Icon && (
            <span className={styles.modalIcon} aria-hidden>
              <Icon size={20} />
            </span>
          )}
          <h2 id={titleId}>{title}</h2>
          <IconButton icon={X} label="Cerrar" onClick={onClose} />
        </header>
        <div className={styles.modalBody}>{children}</div>
        {actions && <div className={styles.modalActions}>{actions}</div>}
      </m.div>
    </m.div>
  );
}
