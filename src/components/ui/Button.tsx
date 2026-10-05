import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, ExternalLink } from 'lucide-react';
import styles from './Button.module.scss';

type Variant = 'primary' | 'dark' | 'outline' | 'outline-light' | 'light' | 'ghost';
type IconKind = 'arrow' | 'download' | 'external' | 'none';

interface BaseProps {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconKind;
  leading?: ReactNode;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = BaseProps &
  (
    | ({ to: string; href?: never } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>)
    | ({ href: string; to?: never; download?: boolean | string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ to?: never; href?: never } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  );

const ICONS = { arrow: ArrowRight, download: Download, external: ExternalLink };

/** Botón de acción de la marca. Renderiza <Link>, <a> o <button> según las props. */
const Button = forwardRef<HTMLElement, ButtonProps>(function Button(props, ref) {
  const { variant = 'primary', size = 'md', icon = 'arrow', leading, block, className, children, ...rest } = props;
  const Icon = icon !== 'none' ? ICONS[icon] : null;
  const cls = [styles.btn, styles[variant], styles[size], block && styles.block, className].filter(Boolean).join(' ');
  const content = (
    <>
      {leading}
      <span>{children}</span>
      {Icon && <Icon className={[styles.icon, icon === 'arrow' && styles.arrow].filter(Boolean).join(' ')} size={18} aria-hidden />}
    </>
  );

  if ('to' in rest && rest.to) {
    const { to, ...a } = rest;
    return (
      <Link ref={ref as React.Ref<HTMLAnchorElement>} to={to} className={cls} {...a}>
        {content}
      </Link>
    );
  }
  if ('href' in rest && rest.href) {
    const external = /^https?:/.test(rest.href);
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={cls}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }
  const b = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type={b.type ?? 'button'} className={cls} {...b}>
      {content}
    </button>
  );
});

export default Button;
