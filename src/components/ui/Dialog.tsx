import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import IconButton from './IconButton';
import styles from './Dialog.module.scss';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hideTitle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  variant?: 'default' | 'dark';
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Modal basado en <dialog> nativo: foco atrapado, Escape y fondo inerte gratis.
 * Bloquea el scroll del body mientras está abierto.
 */
export default function Dialog({ open, onClose, title, hideTitle, size = 'md', variant = 'default', children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && d.open) d.close();
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[size], styles[variant]].filter(Boolean).join(' ')}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className={styles.content}>
          <div className={[styles.header, hideTitle && styles.headerFloating].filter(Boolean).join(' ')}>
            {!hideTitle && <h2 className={styles.title}>{title}</h2>}
            <IconButton label="Cerrar" variant={variant === 'dark' ? 'overlay' : 'ghost'} onClick={onClose}>
              <X size={20} />
            </IconButton>
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
