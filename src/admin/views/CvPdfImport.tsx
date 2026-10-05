import { useRef, useState } from 'react';
import { FileUp, LoaderCircle, ShieldCheck } from 'lucide-react';
import type { CvDraft } from '../cvImport';
import styles from '../Admin.module.scss';

interface Props {
  onImport: (cv: CvDraft) => void;
  /** Ya hay antecedentes cargados (se pide confirmación antes de reemplazarlos). */
  hasItems: boolean;
}

/** Subir el CV en PDF y completar el currículum automáticamente (queda como borrador para revisar). */
export default function CvPdfImport({ onImport, hasItems }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (hasItems && !confirm('El currículum ya tiene antecedentes cargados. ¿Reemplazarlos por los del PDF?')) return;
    setBusy(true);
    setMsg(null);
    try {
      const { importCvFromPdf } = await import('../cvImport');
      const { cv, descartadas } = await importCvFromPdf(file);
      const n = cv.secciones.reduce((a, s) => a + s.items.length, 0);
      if (!n) {
        setMsg({ ok: false, text: 'No reconocimos las secciones de este PDF. Si es un escaneo (una imagen), no tiene texto para leer: cargalo a mano.' });
        return;
      }
      onImport(cv);
      setMsg({
        ok: true,
        text: `Importamos ${n} antecedentes en ${cv.secciones.length} secciones${descartadas ? ` y descartamos ${descartadas} líneas con datos personales` : ''}. Revisalos abajo y tocá "Guardar".`,
      });
    } catch {
      setMsg({ ok: false, text: 'No se pudo leer el PDF. Probá con otro archivo.' });
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
          Lo leemos y completamos las secciones solas. Después revisás y corregís lo que haga falta.{' '}
          <span className={styles.cvPrivacy}>
            <ShieldCheck size={14} aria-hidden /> DNI, teléfonos, mails y domicilio se descartan.
          </span>
        </p>
      </div>
      <button type="button" className={styles.btnSecondary} onClick={() => input.current?.click()} disabled={busy}>
        {busy ? <LoaderCircle size={18} className={styles.spin} /> : <FileUp size={18} />}
        {busy ? 'Leyendo el PDF…' : 'Importar desde PDF'}
      </button>
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {msg && <p className={[msg.ok ? styles.notice : styles.errorBox, styles.cvMsg].join(' ')}>{msg.text}</p>}
    </div>
  );
}
