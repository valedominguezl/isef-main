import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoaderCircle, Sparkles, X } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { isAbort, type CursoIa } from '../api';
import { Button } from '../ui/Button';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toaster';
import styles from '../Admin.module.scss';

type Obj = Record<string, unknown>;

/** Lo que llega navegando al editor de un curso nuevo armado con IA. */
export interface DesdeIa {
  inicial: Obj;
  /** Palabras (en inglés) para buscar la foto de portada. */
  buscarFoto?: string;
}

const TEXTOS = ['titulo', 'subtitulo', 'descripcion', 'modalidad', 'duracion', 'costo', 'condiciones', 'importante'] as const;

const fechaValida = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

/** Respuesta de la IA → campos del curso (solo los que vinieron con algo). */
export function cursoDesdeIa(c: CursoIa): Obj {
  const out: Obj = { destacado: false };
  for (const k of TEXTOS) {
    const v = typeof c[k] === 'string' ? c[k].trim() : '';
    if (v) out[k] = v;
  }
  const fecha = c.fechaInicio?.trim() ?? '';
  if (fechaValida(fecha)) out.fechaInicio = fecha;
  const temario = (c.temario ?? [])
    .map((t) => ({ tema: (t.tema ?? '').trim(), subtemas: (t.subtemas ?? []).map((s) => s.trim()).filter(Boolean) }))
    .filter((t) => t.tema);
  if (temario.length) out.temario = temario;
  return out;
}

const MAX = 60_000;

/** "Nuevo curso con IA": se pega el texto del curso y se abre el editor ya completo (no se guarda nada solo). */
export default function NuevoCursoIa() {
  const { api } = useAdmin();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pedido = useRef<AbortController | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  const cerrar = () => {
    pedido.current?.abort();
    setBusy(false);
    setError(null);
    setOpen(false);
  };

  const generar = async () => {
    if (!texto.trim() || busy) return;
    if (texto.length > MAX) {
      setError('El texto es demasiado largo.');
      return;
    }
    const ctrl = new AbortController();
    pedido.current = ctrl;
    setBusy(true);
    setError(null);
    try {
      const curso = await api.iaCurso(texto, ctrl.signal);
      const state: DesdeIa = { inicial: cursoDesdeIa(curso), buscarFoto: curso.busquedaFoto?.trim() || undefined };
      setOpen(false);
      setTexto('');
      navigate('/admin/c/cursos/nueva', { state });
      toast.show({ text: 'Curso armado con IA. Revisalo y tocá Guardar.', icon: Sparkles });
    } catch (e) {
      if (!isAbort(e)) setError((e as Error).message);
    } finally {
      if (pedido.current === ctrl) setBusy(false);
    }
  };

  return (
    <>
      <Button variant="secondary" icon={Sparkles} onClick={() => setOpen(true)}>
        Nuevo curso con IA
      </Button>
      <Modal
        open={open}
        onClose={cerrar}
        title="Nuevo curso con IA"
        icon={Sparkles}
        initialFocus={area}
        actions={
          <>
            <Button variant="secondary" icon={X} onClick={cerrar}>
              Cancelar
            </Button>
            <Button variant="primary" icon={busy ? LoaderCircle : Sparkles} spin={busy} disabled={busy || !texto.trim()} onClick={generar}>
              {busy ? 'Generando…' : 'Generar'}
            </Button>
          </>
        }
      >
        <div className={styles.field}>
          <label htmlFor="curso-ia-texto" className={styles.label}>
            Pegá la descripción del curso
          </label>
          <textarea
            id="curso-ia-texto"
            ref={area}
            className={[styles.input, styles.iaText].join(' ')}
            value={texto}
            readOnly={busy}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generar();
            }}
          />
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
