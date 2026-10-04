import { useState } from 'react';
import { FileJson, ImageIcon, Trash2, UploadCloud, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import styles from '../Admin.module.scss';

export default function PendingDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pending, discard, publish, publishing, mode } = useAdmin();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  if (!open) return null;

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

  return (
    <div className={styles.drawerBackdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-label="Cambios pendientes">
        <header>
          <h2>Cambios pendientes</h2>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>
        {done && !pending.length ? (
          <div className={styles.success}>
            <UploadCloud size={32} />
            <p>
              <strong>¡Publicado!</strong>{' '}
              {mode === 'github' ? 'GitHub está construyendo el sitio: en 1 o 2 minutos los cambios estarán online.' : 'Los archivos se guardaron en tu disco. Hacé commit y push cuando quieras publicarlos.'}
            </p>
          </div>
        ) : pending.length ? (
          <>
            <ul className={styles.pendingList}>
              {pending.map((p) => (
                <li key={p.path}>
                  {p.path.endsWith('.json') ? <FileJson size={16} /> : <ImageIcon size={16} />}
                  <span>
                    {'delete' in p ? <s>{p.label}</s> : p.label}
                    <small>{p.path}</small>
                  </span>
                  <button type="button" className={styles.iconBtn} onClick={() => discard(p.path)} aria-label="Descartar">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <label className={styles.label} htmlFor="commit-msg">
              Descripción (opcional)
            </label>
            <input id="commit-msg" className={styles.input} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Ej.: nueva novedad sobre el curso de fuerza" />
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.drawerActions}>
              <button type="button" className={styles.btnGhost} onClick={() => confirm('¿Descartar todos los cambios?') && discard()}>
                Descartar todo
              </button>
              <button type="button" className={styles.btnPrimary} onClick={onPublish} disabled={publishing}>
                <UploadCloud size={18} /> {publishing ? 'Publicando…' : mode === 'github' ? 'Publicar en el sitio' : 'Guardar en disco'}
              </button>
            </div>
          </>
        ) : (
          <p className={styles.help}>No hay cambios sin publicar.</p>
        )}
      </aside>
    </div>
  );
}
