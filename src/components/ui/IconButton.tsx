import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.scss';

interface BaseProps {
  /** Texto accesible (se vuelve aria-label): el botón no tiene texto visible. */
  label: string;
  /** El ícono (lucide o de Icons.tsx). El nombre accesible sale de `label`. */
  children: ReactNode;
  /** sm 36 px (44 px en pantallas táctiles) · md 44 px · lg 48 px. */
  size?: 'sm' | 'md' | 'lg';
  /** ghost: sin borde · outline: con borde · overlay: círculo oscuro translúcido sobre fotos. */
  variant?: 'ghost' | 'outline' | 'overlay';
  /** default: neutro sobre claro · brand: violeta (gemelo de Button outline) · light: sobre fondos oscuros. */
  tone?: 'default' | 'brand' | 'light';
  className?: string;
}

type IconButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'aria-label'>)
    | ({ href?: never } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>)
  );

/**
 * Botón redondo de solo ícono (flechas de carrusel, cerrar, borrar búsqueda, redes).
 * Con `href` renderiza un <a> (enlaces a redes); si no, un <button type="button">.
 */
export default function IconButton({ label, children, size = 'md', variant = 'ghost', tone = 'default', className, ...rest }: IconButtonProps) {
  const cls = [styles.btn, styles[size], styles[variant], styles[tone], className].filter(Boolean).join(' ');
  if ('href' in rest && rest.href != null) {
    return (
      <a className={cls} aria-label={label} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} aria-label={label} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
