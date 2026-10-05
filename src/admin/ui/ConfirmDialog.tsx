import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { Trash2, X, type LucideIcon } from 'lucide-react';
import { Button } from './Button';
import styles from './Ui.module.scss';

export interface ConfirmOptions {
  title: string;
  /** Una línea con la consecuencia. */
  body?: string;
  confirmLabel?: string;
  icon?: LucideIcon;
}

type Ask = (o: ConfirmOptions) => Promise<boolean>;
const Ctx = createContext<Ask | null>(null);

/** `const ok = await confirm({ title, body })`: diálogo de confirmación (reemplaza al `confirm()` del navegador). */
export function useConfirm() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useConfirm fuera de ConfirmProvider');
  return c;
}

const EASE_IN = [0.25, 0.46, 0.45, 0.94] as const;
const EASE_OUT = [0.4, 0, 1, 1] as const;

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

function Dialog({ title, body, confirmLabel = 'Eliminar', icon: Icon = Trash2, onClose }: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const ids = { title: useId(), body: useId() };
  const box = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  // Foco: entra en "Cancelar" (la opción segura) y al cerrar vuelve a donde estaba
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    cancel.current?.focus();
    return () => prev?.focus?.();
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
      animate={{ opacity: 1, transition: { duration: 0.35, ease: EASE_IN } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
    >
      <m.div
        ref={box}
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={ids.title}
        aria-describedby={body ? ids.body : undefined}
        onKeyDown={onKeyDown}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: EASE_IN } }}
        exit={{ opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.2, ease: EASE_OUT } }}
      >
        <span className={styles.dialogIcon} aria-hidden>
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
          <Button variant="danger" solid icon={Icon} onClick={() => onClose(true)}>
            {confirmLabel}
          </Button>
        </div>
      </m.div>
    </m.div>
  );
}
