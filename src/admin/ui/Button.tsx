import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { AnimatePresence, m } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import adm from '../Admin.module.scss';
import styles from './Ui.module.scss';

/* ─────────────────────────────── Botón con texto ───────────────────────────────
 * Siempre ícono + texto y el mismo alto. Con `to` es un link interno; con `href`, uno externo.
 */
export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANT: Record<Variant, string> = { primary: adm.btnPrimary, secondary: adm.btnSecondary, ghost: adm.btnGhost, danger: adm.btnDanger };

type ButtonProps = {
  variant?: Variant;
  icon: LucideIcon;
  /** Danger con relleno: solo para el botón que confirma una eliminación. */
  solid?: boolean;
  /** Ícono girando (p. ej. mientras procesa). */
  spin?: boolean;
  to?: string;
  href?: string;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', icon: Icon, solid, spin, to, href, children, className, type = 'button', ...rest },
  ref,
) {
  const cls = [VARIANT[variant], solid && styles.dangerSolid, className].filter(Boolean).join(' ');
  const inner = (
    <>
      <Icon size={18} aria-hidden className={spin ? adm.spin : undefined} />
      <span>{children}</span>
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  return (
    <button ref={ref} type={type} className={cls} {...rest}>
      {inner}
    </button>
  );
});

/* ──────────────────────────────────── Tooltip ────────────────────────────────────
 * Va a document.body (las filas y tarjetas recortan lo que sobresale). Aparece al pasar el mouse
 * (con una pequeña espera) o al llegar con el teclado; se va con Escape, al hacer clic o al hacer scroll.
 */
function useTooltip(label: string) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const timer = useRef<number>(undefined);
  const clear = () => window.clearTimeout(timer.current);
  const hide = () => {
    clear();
    setRect(null);
  };
  useEffect(() => {
    if (!rect) return;
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', hide, { capture: true });
  }, [rect]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => clear, []);

  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      clear();
      timer.current = window.setTimeout(() => setRect(el.getBoundingClientRect()), 350);
    },
    onMouseLeave: hide,
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      if (e.currentTarget.matches(':focus-visible')) setRect(e.currentTarget.getBoundingClientRect());
    },
    onBlur: hide,
    onPointerDown: hide,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    },
  };

  const below = rect ? rect.top < 48 : false;
  const bubble =
    typeof document === 'undefined'
      ? null
      : createPortal(
          <AnimatePresence>
            {rect && (
              <span
                className={styles.tipAnchor}
                data-below={below || undefined}
                style={{ left: Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90), top: below ? rect.bottom : rect.top }}
              >
                <m.span
                  role="tooltip"
                  className={styles.tip}
                  initial={{ opacity: 0, y: below ? -4 : 4 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }}
                  exit={{ opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }}
                >
                  {label}
                </m.span>
              </span>
            )}
          </AnimatePresence>,
          document.body,
        );
  return { handlers, bubble };
}

/* ─────────────────────────── Botón de solo ícono (con tooltip) ─────────────────────────── */
type IconButtonProps = {
  icon: LucideIcon;
  /** Texto del tooltip y del lector de pantalla (obligatorio). */
  label: string;
  /** Tooltip distinto del nombre accesible (p. ej. un interruptor: nombre fijo + estado y ayuda en el tooltip). */
  tip?: string;
  size?: number;
  /** Relleno del ícono (p. ej. la estrella activa). */
  fill?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>;

export function IconButton({ icon: Icon, label, tip, size = 16, fill, className, type = 'button', ...rest }: IconButtonProps) {
  const { handlers, bubble } = useTooltip(tip ?? label);
  return (
    <>
      <button
        type={type}
        aria-label={label}
        className={[adm.iconBtn, className].filter(Boolean).join(' ')}
        {...rest}
        onMouseEnter={handlers.onMouseEnter}
        onMouseLeave={handlers.onMouseLeave}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        onPointerDown={handlers.onPointerDown}
        onKeyDown={(e) => {
          handlers.onKeyDown(e);
          rest.onKeyDown?.(e);
        }}
      >
        <Icon size={size} fill={fill ?? 'none'} aria-hidden />
      </button>
      {bubble}
    </>
  );
}
