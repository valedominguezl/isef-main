import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { FileJson, FileMinus, ImageIcon, LoaderCircle, Undo2, UploadCloud, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import type { Change } from '../store';
import { Button, IconButton } from '../ui/Button';
import { useConfirm } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toaster';
import styles from '../Admin.module.scss';

const iconOf = (p: Change) => ('delete' in p ? FileMinus : p.path.endsWith('.json') ? FileJson : ImageIcon);

export default function PendingDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pending, discard, stage, publish, publishing, mode } = useAdmin();
  const confirm = useConfirm();
  const toast = useToast();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const panel = useRef<HTMLElement>(null);
  // Mientras el diálogo de confirmación está abierto, Escape lo cierra a él y no al cajón
  const asking = useRef(false);

  // Foco al abrir, Escape para cerrar, y el foco vuelve a donde estaba
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !asking.current && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPublish = async () => {
    setError(null);
    try {
      await publish(msg.trim() || `Contenido: ${pending.map((p) => p.label).slice(0, 3).join(', ')}${pending.length > 3 ? '…' : ''}`);
      setDone(true);
      setMsg('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const discardOne = (p: Change) => {
    discard(p.path);
    toast.show({ text: `Se descartó «${p.label}».`, icon: Undo2, undo: () => stage([p]) });
  };

  const discardAll = async () => {
    asking.current = true;
    const ok = await confirm({
      title: '¿Descartar todos los cambios?',
      body: `Se pierden ${pending.length} cambio${pending.length > 1 ? 's' : ''} sin publicar.`,
      confirmLabel: 'Descartar todo',
    });
    asking.current = false;
    if (!ok) return;
    const before = pending;
    discard();
    toast.show({ text: before.length > 1 ? `Se descartaron ${before.length} cambios.` : `Se descartó «${before[0].label}».`, icon: Undo2, undo: () => stage(before) });
  };

  // Fondo con fundido y panel que entra desde la derecha; al cerrar, sale más rápido
  return (
    <AnimatePresence>
      {open && (
        <m.div
          className={styles.drawerBackdrop}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }}
          exit={{ opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
        >
          <m.aside
            ref={panel}
            tabIndex={-1}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Cambios pendientes"
            initial={{ x: 48, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }}
            exit={{ x: 32, opacity: 0, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }}
          >
            <header>
              <h2>
                <UploadCloud size={20} aria-hidden /> Cambios pendientes
              </h2>
              <IconButton icon={X} label="Cerrar" size={18} onClick={onClose} />
            </header>
            {done && !pending.length ? (
              <div className={styles.success}>
                <UploadCloud size={32} />
                <p>
                  <strong>¡Publicado!</strong>{' '}
                  {mode === 'github' ? 'En 1 o 2 minutos los cambios estarán en el sitio.' : 'Los archivos se guardaron en tu disco. Hacé commit y push cuando quieras publicarlos.'}
                </p>
              </div>
            ) : pending.length ? (
              <>
                <ul className={styles.pendingList}>
                  {pending.map((p) => {
                    const Icon = iconOf(p);
                    return (
                      <li key={p.path}>
                        <Icon size={18} aria-hidden />
                        <span>{'delete' in p ? <s>{p.label}</s> : p.label}</span>
                        <IconButton icon={Undo2} label={`Descartar «${p.label}»`} onClick={() => discardOne(p)} />
                      </li>
                    );
                  })}
                </ul>
                <label className={styles.label} htmlFor="commit-msg">
                  Descripción (opcional)
                </label>
                <input id="commit-msg" className={styles.input} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ej.: nueva novedad sobre el curso de fuerza" />
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.drawerActions}>
                  <Button variant="danger" icon={X} onClick={discardAll}>
                    Descartar todo
                  </Button>
                  <Button variant="primary" icon={publishing ? LoaderCircle : UploadCloud} onClick={onPublish} disabled={publishing} spin={publishing}>
                    {publishing ? 'Publicando…' : mode === 'github' ? 'Publicar en el sitio' : 'Guardar en disco'}
                  </Button>
                </div>
              </>
            ) : (
              <p className={styles.help}>No hay cambios sin publicar.</p>
            )}
          </m.aside>
        </m.div>
      )}
    </AnimatePresence>
  );
}
