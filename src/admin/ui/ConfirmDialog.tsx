import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Trash2, X, type LucideIcon } from 'lucide-react';
import { DURATION, EASE_OUT, exit } from '@/lib/motion';
import { Button } from './Button';
import styles from './Ui.module.scss';

export interface ConfirmOptions {
  title: string;
  /** Una línea con la consecuencia. */
  body?: string;
  confirmLabel?: string;
  icon?: LucideIcon;
  /** 'accion' = botón violeta (enviar, publicar); por defecto es una eliminación (rojo). */
  tono?: 'peligro' | 'accion';
}

type Ask = (o: ConfirmOptions) => Promise<boolean>;
const Ctx = createContext<Ask | null>(null);

/** `const ok = await confirm({ title, body })`: diálogo de confirmación (reemplaza al `confirm()` del navegador). */
export function useConfirm() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useConfirm fuera de ConfirmProvider');
  return c;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const ask = useCallback<Ask>((o) => new Promise((resolve) => setReq({ ...o, resolve })), []);
  const close = (ok: boolean) => {
    req?.resolve(ok);
    setReq(null);
  };

  return (
    <Ctx.Provider value={ask}>
      {children}
      <AnimatePresence>{req && <Dialog key="confirm" {...req} onClose={close} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

function Dialog({ title, body, confirmLabel = 'Eliminar', icon: Icon = Trash2, tono = 'peligro', onClose }: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const ids = { title: useId(), body: useId() };
  const box = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  // Foco: entra en "Cancelar" (la opción segura) y al cerrar vuelve a donde estaba
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = box.current;
    cancel.current?.focus();
    return () => {
      // Si al confirmar se abrió otro diálogo y tiene el foco, no se lo quita
      const a = document.activeElement;
      if (!a || a === document.body || el?.contains(a)) prev?.focus?.();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose(false);
      return;
    }
    if (e.key !== 'Tab' || !box.current) return;
    // El foco no sale del diálogo
    const f = [...box.current.querySelectorAll<HTMLElement>('button:not(:disabled)')];
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
      onMouseDown={(e) => e.target === e.currentTarget && onClose(false)}
      initial={{ opacity: 0 }}
      // Más corto que los demás diálogos: aparece en medio de una tarea (borrar, enviar), decenas de veces por día
      animate={{ opacity: 1, transition: { duration: DURATION.base, ease: EASE_OUT } }}
      exit={{ opacity: 0, transition: exit() }}
    >
      <m.div
        ref={box}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={ids.title}
        aria-describedby={body ? ids.body : undefined}
        onKeyDown={onKeyDown}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } }}
        exit={{ opacity: 0, scale: 0.98, y: 6, transition: exit() }}
      >
        <span className={[styles.dialogIcon, tono === 'accion' && styles.dialogIconAccion].filter(Boolean).join(' ')} aria-hidden>
          <Icon size={22} />
        </span>
        <div>
          <h2 id={ids.title}>{title}</h2>
          {body && <p id={ids.body}>{body}</p>}
        </div>
        <div className={styles.dialogActions}>
          <Button ref={cancel} variant="secondary" icon={X} onClick={() => onClose(false)}>
            Cancelar
          </Button>
          <Button variant={tono === 'accion' ? 'primary' : 'danger'} solid={tono !== 'accion'} icon={Icon} onClick={() => onClose(true)}>
            {confirmLabel}
          </Button>
        </div>
      </m.div>
    </m.div>
  );
}
