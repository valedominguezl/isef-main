import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Save } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { getSingleton } from '../config';
import { clean, type Errors } from '../fields/Fields';
import { useFile } from '../useEntries';
import { FormBody, useRefs, validate } from './EntryEditor';
import styles from '../Admin.module.scss';

type Obj = Record<string, unknown>;

export default function SingletonEditor() {
  const { key = '' } = useParams();
  const cfg = getSingleton(key);
  const loaded = useFile(cfg?.file);
  const { stage } = useAdmin();
  const refs = useRefs();
  const [draft, setDraft] = useState<Obj | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (loaded) setDraft(loaded);
  }, [loaded]);

  if (!cfg) return <p>Sección desconocida.</p>;
  if (!draft) return <p className={styles.help}>Cargando…</p>;

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
      {saved && <p className={styles.notice}>{saved}</p>}
      {Object.keys(errors).length > 0 && (
        <p className={styles.errorBox} role="alert">
          Hay {Object.keys(errors).length} campo(s) para corregir: {Object.keys(errors).slice(0, 3).join(', ')}
        </p>
      )}
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
