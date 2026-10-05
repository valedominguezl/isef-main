import { useEffect, useRef, useState, type ReactNode } from 'react';
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
 * Bloquea el scroll del body mientras está abierto. Entra suave y también sale animado:
 * al cerrarse queda montado con la clase `closing` hasta que termina la animación de salida.
 */
export default function Dialog({ open, onClose, title, hideTitle, size = 'md', variant = 'default', children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      setClosing(false);
      setRendered(true);
      if (!d.open) {
        d.showModal();
        document.documentElement.style.overflow = 'hidden';
      }
    } else if (d.open) {
      setClosing(true);
      // Respaldo por si la animación de salida no llega a dispararse (pestaña oculta, estilos sin cargar)
      const t = setTimeout(() => d.open && d.close(), 600);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(
    () => () => {
      document.documentElement.style.overflow = '';
    },
    [],
  );

  /** Cierre real del <dialog> (después de la animación de salida, o si el navegador lo cierra solo). */
  const onNativeClose = () => {
    setClosing(false);
    setRendered(false);
    document.documentElement.style.overflow = '';
    if (openRef.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={[styles.dialog, styles[size], styles[variant], closing && styles.closing].filter(Boolean).join(' ')}
      aria-label={title}
      onClose={onNativeClose}
      onCancel={(e) => {
        // Escape: en vez del cierre instantáneo del navegador, pide cerrar y deja correr la salida
        e.preventDefault();
        onClose();
      }}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget && !e.pseudoElement) ref.current?.close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {rendered && (
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
