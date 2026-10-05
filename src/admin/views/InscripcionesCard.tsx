import { useEffect, useId, useState } from 'react';
import { CalendarRange, Rocket, Save } from 'lucide-react';
import { sitioSchema } from '@/content/schema';
import { formatDate } from '@/lib/format';
import { useAdmin } from '../AdminContext';
import { useFile } from '../useEntries';
import { clean } from '../fields/Fields';
import { Sk } from './Skeleton';
import Notice from './Notice';
import styles from '../Admin.module.scss';

type Obj = Record<string, unknown>;
type Insc = { abiertas?: boolean; texto?: string; inicio?: string; cierre?: string };
const FILE = 'content/sitio.json';

/** Lo más importante del panel: abrir/cerrar inscripciones y su ventana de fechas. Guarda en content/sitio.json. */
export default function InscripcionesCard() {
  const { data: loaded, error: loadError } = useFile(FILE);
  const { stage } = useAdmin();
  const [insc, setInsc] = useState<Insc | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const ids = { sw: useId(), ini: useId(), fin: useId() };

  // Solo la primera vez: una relectura no pisa un cambio sin guardar
  useEffect(() => {
    if (loaded) setInsc((v) => v ?? { ...((loaded.inscripciones as Insc) ?? {}) });
  }, [loaded]);

  const set = (patch: Insc) => {
    setInsc((v) => ({ ...v, ...patch }));
    setMsg(null);
  };

  const save = () => {
    if (!loaded || !insc) return;
    if (insc.inicio && insc.cierre && insc.cierre < insc.inicio) {
      setMsg({ ok: false, text: 'La fecha de cierre tiene que ser posterior a la de apertura.' });
      return;
    }
    const next = clean({ ...loaded, inscripciones: { ...insc, texto: insc.texto || 'Inscripciones abiertas' } }) as Obj;
    const res = sitioSchema.safeParse(next);
    if (!res.success) {
      setMsg({ ok: false, text: 'No se pudo guardar: revisá "Datos del instituto".' });
      return;
    }
    stage([{ path: FILE, content: `${JSON.stringify(next, null, 2)}\n`, encoding: 'utf8', label: 'Inscripciones' }]);
    setMsg({ ok: true, text: 'Guardado. Tocá "Publicar" arriba a la derecha para que se vea en el sitio.' });
  };

  const estado = !insc
    ? null
    : !insc.abiertas
      ? 'Cerradas: el sitio no muestra el botón "Inscribite".'
      : insc.cierre
        ? `Abiertas${insc.inicio ? ` desde el ${formatDate(insc.inicio, { year: false })}` : ''} hasta el ${formatDate(insc.cierre, { year: false })}. Arriba del sitio se ve la cuenta regresiva.`
        : 'Abiertas, sin fecha de cierre: no se muestra la franja de aviso. Las fechas son opcionales.';

  return (
    <section className={[styles.panel, styles.inscCard, insc?.abiertas && styles.inscOn].filter(Boolean).join(' ')}>
      <div className={styles.inscHead}>
        <span className={styles.inscIcon} aria-hidden>
          <Rocket size={22} />
        </span>
        <div>
          <h2>Inscripciones</h2>
          <p className={styles.help}>{estado ?? (loadError ? 'No se pudo leer el estado. Revisá la conexión y recargá la página.' : <Sk w={280} h={14} />)}</p>
        </div>
        {insc ? (
          <label className={styles.switchRow} htmlFor={ids.sw}>
            <input
              id={ids.sw}
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={Boolean(insc.abiertas)}
              onChange={(e) => set({ abiertas: e.target.checked })}
            />
            <span>{insc.abiertas ? 'Abiertas' : 'Cerradas'}</span>
          </label>
        ) : (
          <Sk w={120} h={28} r={999} />
        )}
      </div>

      {insc && (
        <div className={styles.inscBody}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={ids.ini}>
              <CalendarRange size={14} aria-hidden /> Abren el (opcional)
            </label>
            <input id={ids.ini} type="date" className={styles.input} value={insc.inicio ?? ''} onChange={(e) => set({ inicio: e.target.value || undefined })} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={ids.fin}>
              <CalendarRange size={14} aria-hidden /> Cierran el (opcional)
            </label>
            <input id={ids.fin} type="date" className={styles.input} value={insc.cierre ?? ''} onChange={(e) => set({ cierre: e.target.value || undefined })} />
          </div>
          <button type="button" className={styles.btnPrimary} onClick={save}>
            <Save size={18} /> Guardar
          </button>
        </div>
      )}
      <Notice show={!!msg} ok={msg?.ok}>
        {msg?.text}
      </Notice>
    </section>
  );
}
