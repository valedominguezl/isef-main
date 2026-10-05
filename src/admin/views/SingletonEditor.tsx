import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ExternalLink, Save } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { getSingleton } from '../config';
import { clean, type Errors } from '../fields/Fields';
import { useFile } from '../useEntries';
import { FormBody, useRefs, validate } from './EntryEditor';
import { SkeletonForm, SkeletonHead } from './Skeleton';
import type { Field } from '../config';
import Notice from './Notice';
import styles from '../Admin.module.scss';

const usesRefs = (fields: Field[]): boolean => fields.some((f) => f.type === 'reference' || ('fields' in f && usesRefs(f.fields)));

type Obj = Record<string, unknown>;

export default function SingletonEditor() {
  const { key = '' } = useParams();
  const cfg = getSingleton(key);
  const { data: loaded, error: loadError } = useFile(cfg?.file);
  const { stage } = useAdmin();
  const refs = useRefs(cfg ? usesRefs(cfg.fields) : false);
  const [draft, setDraft] = useState<Obj | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    // null = el archivo todavía no existe: se empieza vacío en vez de quedar cargando
    if (loaded !== undefined) setDraft(loaded ?? {});
  }, [loaded]);

  if (!cfg) return <p>Sección desconocida.</p>;
  if (!draft && loadError)
    return (
      <p className={styles.errorBox} role="alert">
        No se pudo leer el contenido ({loadError}). Revisá la conexión y{' '}
        <button type="button" className={styles.btnGhost} onClick={() => window.location.reload()}>
          volvé a intentar
        </button>
        .
      </p>
    );
  if (!draft)
    return (
      <>
        <SkeletonHead />
        <SkeletonForm />
      </>
    );

  const save = () => {
    const res = validate(cfg.schema, clean(draft));
    if (!res.ok) {
      setErrors(res.errors);
      return;
    }
    setErrors({});
    stage([{ path: cfg.file, content: `${JSON.stringify(clean(draft), null, 2)}\n`, encoding: 'utf8', label: cfg.label }]);
    setSaved('Guardado. Recordá tocar "Publicar" arriba a la derecha para que se vea en el sitio.');
  };

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <h1>{cfg.label}</h1>
          <p className={styles.help}>{cfg.description}</p>
        </div>
        <div className={styles.headActions}>
          {cfg.sitePath && (
            <a href={cfg.sitePath} target="_blank" rel="noreferrer" className={styles.btnGhost}>
              <ExternalLink size={16} /> Ver en el sitio
            </a>
          )}
          <button type="button" className={styles.btnPrimary} onClick={save}>
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>
      <Notice show={!!saved}>{saved}</Notice>
      <Notice show={Object.keys(errors).length > 0} ok={false}>
        Hay {Object.keys(errors).length} campo(s) para corregir: {Object.keys(errors).slice(0, 3).join(', ')}
      </Notice>
      <div className={styles.narrow}>
        <FormBody
          fields={cfg.fields}
          draft={draft}
          setDraft={(d) => {
            setDraft(d);
            setSaved(null);
          }}
          errors={errors}
          entrySlug={cfg.key}
          refs={refs}
        />
      </div>
    </>
  );
}
