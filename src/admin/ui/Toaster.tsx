import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { CheckCircle2, Undo2, UploadCloud, X, type LucideIcon } from 'lucide-react';
import { Button, IconButton } from './Button';
import styles from './Ui.module.scss';

export interface ToastOptions {
  text: ReactNode;
  icon?: LucideIcon;
  /** Muestra "Deshacer": se llama una sola vez y cierra el aviso. */
  undo?: () => void;
  action?: { label: string; icon: LucideIcon; onClick: () => void };
}

interface ToastApi {
  show: (t: ToastOptions) => void;
  /** "Guardado. Falta publicar." con el botón para abrir los cambios pendientes. */
  saved: (text?: string, undo?: () => void) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast fuera de ToastProvider');
  return c;
}

const DURATION = 6000;
const MAX = 3;
type Item = ToastOptions & { id: number };

/** Avisos abajo a la derecha (abajo a lo ancho en el celular). Se van solos a los 6 s; se pausan con el mouse o el foco. */
export function ToastProvider({ children, onOpenPending }: { children: ReactNode; onOpenPending: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const next = useRef(0);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const show = useCallback((t: ToastOptions) => setItems((l) => [...l, { ...t, id: ++next.current }].slice(-MAX)), []);
  const api = useMemo<ToastApi>(
    () => ({
      show,
      saved: (text = 'Guardado. Falta publicar.', undo) =>
        show({ text, icon: CheckCircle2, undo, action: { label: 'Publicar', icon: UploadCloud, onClick: onOpenPending } }),
    }),
    [show, onOpenPending],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <ol className={styles.toasts} aria-live="polite" aria-label="Avisos">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <Toast key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </AnimatePresence>
      </ol>
    </Ctx.Provider>
  );
}

function Toast({ item, onDismiss }: { item: Item; onDismiss: () => void }) {
  const { text, icon: Icon = CheckCircle2, undo, action } = item;
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(onDismiss, DURATION);
    return () => window.clearTimeout(t);
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (fn: () => void) => () => {
    fn();
    onDismiss();
  };

  return (
    // Entra subiendo; al irse se achica en alto para que los de arriba bajen suave
    <m.li
      className={styles.toastWrap}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }}
      exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.toast}>
        <Icon size={20} className={styles.toastIcon} aria-hidden />
        <p>{text}</p>
        <div className={styles.toastActions}>
          {undo && (
            <Button variant="ghost" icon={Undo2} onClick={run(undo)}>
              Deshacer
            </Button>
          )}
          {action && (
            <Button variant="ghost" icon={action.icon} onClick={run(action.onClick)}>
              {action.label}
            </Button>
          )}
          <IconButton icon={X} label="Cerrar aviso" onClick={onDismiss} />
        </div>
      </div>
    </m.li>
  );
}
