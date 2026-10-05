import { useRef, useState } from 'react';
import { ClipboardPaste, FileUp, LoaderCircle, Replace, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { isAbort } from '../api';
import type { CvDraft } from '../cvImport';
import { Button } from '../ui/Button';
import { useConfirm } from '../ui/ConfirmDialog';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toaster';
import Notice from './Notice';
import styles from '../Admin.module.scss';

interface Props {
  /** Aplica el CV importado al borrador y devuelve cómo deshacerlo. */
  onImport: (cv: CvDraft) => () => void;
  /** Ya hay antecedentes cargados (se pide confirmación antes de reemplazarlos). */
  hasItems: boolean;
}

type Resultado = { cv: CvDraft; descartadas: number; conIa: boolean };

/** Subir el CV en PDF (o pegarlo como texto) y completar el currículum automáticamente (queda como borrador para revisar). */
export default function CvPdfImport({ onImport, hasItems }: Props) {
  const { api } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<null | 'leyendo' | 'ordenando'>(null);
  const [error, setError] = useState<string | null>(null);
  const [pegar, setPegar] = useState(false);
  const [texto, setTexto] = useState('');
  const [errorTexto, setErrorTexto] = useState<string | null>(null);
  const pedido = useRef<AbortController | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const confirm = useConfirm();
  const toast = useToast();

  const reemplazar = async () =>
    !hasItems || confirm({ title: '¿Reemplazar el currículum?', body: 'Los antecedentes cargados se cambian por los nuevos.', confirmLabel: 'Reemplazar', icon: Replace });

  /** Aplica el resultado (con deshacer). Devuelve false si no se reconoció nada. */
  const aplicar = ({ cv, descartadas, conIa }: Resultado) => {
    const n = cv.secciones.reduce((a, s) => a + s.items.length, 0);
    if (!n) return false;
    const undo = onImport(cv);
    const extra = descartadas ? ` (y descartamos ${descartadas} líneas con datos personales)` : '';
    toast.show({
      text: `${conIa ? 'Importamos' : 'Ordenamos'} ${n} antecedentes${conIa ? '' : ' sin IA'}${extra}. Revisalos y tocá Guardar.`,
      icon: conIa ? Sparkles : FileUp,
      undo,
    });
    return true;
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy('leyendo');
    setError(null);
    try {
      const { pdfLines, ordenarCv } = await import('../cvImport');
      const lines = await pdfLines(file);
      setBusy('ordenando');
      if (!aplicar(await ordenarCv(lines, (t) => api.iaCv(t))))
        setError('No reconocimos las secciones de este PDF. Si es un escaneo (una imagen), no tiene texto para leer: cargalo a mano.');
    } catch {
      setError('No se pudo leer el PDF. Probá con otro archivo.');
    } finally {
      setBusy(null);
      if (input.current) input.current.value = '';
    }
  };

  const cerrarTexto = () => {
    pedido.current?.abort();
    setErrorTexto(null);
    setPegar(false);
  };

  const ordenarTexto = async () => {
    if (!texto.trim() || busy) return;
    const ctrl = new AbortController();
    pedido.current = ctrl;
    setBusy('ordenando');
    setErrorTexto(null);
    try {
      const { ordenarCv, textLines } = await import('../cvImport');
      if (aplicar(await ordenarCv(textLines(texto), (t) => api.iaCv(t, ctrl.signal)))) {
        setPegar(false);
        setTexto('');
      } else setErrorTexto('No reconocimos antecedentes en este texto.');
    } catch (e) {
      if (!isAbort(e)) setErrorTexto((e as Error).message);
    } finally {
      if (pedido.current === ctrl) setBusy(null);
    }
  };

  return (
    <div className={styles.cvImport}>
      <div>
        <strong>¿Tenés el CV en PDF o en texto?</strong>
        <p className={styles.help}>
          Completamos las secciones solas; después revisalas.{' '}
          <span className={styles.cvPrivacy}>
            <ShieldCheck size={14} aria-hidden /> DNI, teléfonos, mails y domicilio se descartan.
          </span>
        </p>
      </div>
      <div className={styles.cvImportActions}>
        <Button
          variant="secondary"
          icon={busy && !pegar ? LoaderCircle : FileUp}
          spin={Boolean(busy && !pegar)}
          disabled={Boolean(busy)}
          onClick={async () => (await reemplazar()) && input.current?.click()}
        >
          {busy === 'leyendo' && !pegar ? 'Leyendo el PDF…' : busy && !pegar ? 'Ordenando…' : 'Importar desde PDF'}
        </Button>
        <Button
          variant="secondary"
          icon={ClipboardPaste}
          disabled={Boolean(busy)}
          onClick={async () => {
            if (!(await reemplazar())) return;
            setErrorTexto(null);
            setPegar(true);
          }}
        >
          Pegar texto
        </Button>
      </div>
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
      <Notice show={!!error} ok={false} className={styles.cvMsg}>
        {error}
      </Notice>

      <Modal
        open={pegar}
        onClose={cerrarTexto}
        title="Pegar el currículum"
        icon={ClipboardPaste}
        initialFocus={area}
        actions={
          <>
            <Button variant="secondary" icon={X} onClick={cerrarTexto}>
              Cancelar
            </Button>
            <Button variant="primary" icon={busy ? LoaderCircle : Sparkles} spin={Boolean(busy)} disabled={Boolean(busy) || !texto.trim()} onClick={ordenarTexto}>
              {busy ? 'Ordenando…' : 'Ordenar'}
            </Button>
          </>
        }
      >
        <div className={styles.field}>
          <label htmlFor="cv-texto" className={styles.label}>
            Pegá el texto del currículum
          </label>
          <textarea
            id="cv-texto"
            ref={area}
            className={[styles.input, styles.iaText].join(' ')}
            value={texto}
            readOnly={Boolean(busy)}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) ordenarTexto();
            }}
          />
          {errorTexto && (
            <p className={styles.error} role="alert">
              {errorTexto}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
