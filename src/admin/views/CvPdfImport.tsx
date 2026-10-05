import { useRef, useState } from 'react';
import { FileUp, LoaderCircle, Replace, ShieldCheck } from 'lucide-react';
import type { CvDraft } from '../cvImport';
import { Button } from '../ui/Button';
import { useConfirm } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toaster';
import Notice from './Notice';
import styles from '../Admin.module.scss';

interface Props {
  /** Aplica el CV importado al borrador y devuelve cómo deshacerlo. */
  onImport: (cv: CvDraft) => () => void;
  /** Ya hay antecedentes cargados (se pide confirmación antes de reemplazarlos). */
  hasItems: boolean;
}

/** Subir el CV en PDF y completar el currículum automáticamente (queda como borrador para revisar). */
export default function CvPdfImport({ onImport, hasItems }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();
  const toast = useToast();

  const pick = async () => {
    if (
      hasItems &&
      !(await confirm({ title: '¿Reemplazar el currículum?', body: 'Los antecedentes cargados se cambian por los del PDF.', confirmLabel: 'Reemplazar', icon: Replace }))
    )
      return;
    input.current?.click();
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { importCvFromPdf } = await import('../cvImport');
      const { cv, descartadas } = await importCvFromPdf(file);
      const n = cv.secciones.reduce((a, s) => a + s.items.length, 0);
      if (!n) {
        setError('No reconocimos las secciones de este PDF. Si es un escaneo (una imagen), no tiene texto para leer: cargalo a mano.');
        return;
      }
      const undo = onImport(cv);
      toast.show({
        text: `Importamos ${n} antecedentes${descartadas ? ` (y descartamos ${descartadas} líneas con datos personales)` : ''}. Revisalos y tocá Guardar.`,
        icon: FileUp,
        undo,
      });
    } catch {
      setError('No se pudo leer el PDF. Probá con otro archivo.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className={styles.cvImport}>
      <div>
        <strong>¿Tenés el CV en PDF?</strong>
        <p className={styles.help}>
          Completamos las secciones solas; después revisalas.{' '}
          <span className={styles.cvPrivacy}>
            <ShieldCheck size={14} aria-hidden /> DNI, teléfonos, mails y domicilio se descartan.
          </span>
        </p>
      </div>
      <Button variant="secondary" icon={busy ? LoaderCircle : FileUp} spin={busy} onClick={pick} disabled={busy}>
        {busy ? 'Leyendo el PDF…' : 'Importar desde PDF'}
      </Button>
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
      <Notice show={!!error} ok={false} className={styles.cvMsg}>
        {error}
      </Notice>
    </div>
  );
}
