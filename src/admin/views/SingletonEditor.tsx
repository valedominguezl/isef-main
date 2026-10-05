import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ExternalLink, RotateCw, Save } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import { getSingleton } from '../config';
import { clean, type Errors } from '../fields/Fields';
import { useFile } from '../useEntries';
import { FormBody, useRefs, validate } from './EntryEditor';
import { SkeletonForm, SkeletonHead } from './Skeleton';
import type { Field } from '../config';
import Notice from './Notice';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toaster';
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
  const toast = useToast();

  useEffect(() => {
    // null = el archivo todavía no existe: se empieza vacío en vez de quedar cargando
    if (loaded !== undefined) setDraft(loaded ?? {});
  }, [loaded]);

  if (!cfg) return <p>Sección desconocida.</p>;
  if (!draft && loadError)
    return (
      <div className={styles.errorBox} role="alert">
        <p>No se pudo leer el contenido ({loadError}). Revisá la conexión.</p>
        <Button variant="ghost" icon={RotateCw} onClick={() => window.location.reload()}>
          Volver a intentar
        </Button>
      </div>
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
    toast.saved();
  };

  return (
    <>
      <div className={styles.pageHead}>
        <div className={styles.titleRow}>
          <span className={styles.titleIcon} aria-hidden>
            <cfg.icon size={22} />
          </span>
          <div>
            <h1>{cfg.label}</h1>
            <p className={styles.help}>{cfg.description}</p>
          </div>
        </div>
        <div className={styles.headActions}>
          {cfg.sitePath && (
            <Button variant="ghost" icon={ExternalLink} href={cfg.sitePath}>
              Ver en el sitio
            </Button>
          )}
          <Button variant="primary" icon={Save} onClick={save}>
            Guardar
          </Button>
        </div>
      </div>
      <Notice show={Object.keys(errors).length > 0} ok={false}>
        Hay {Object.keys(errors).length} campo(s) para corregir.
      </Notice>
      <div className={styles.narrow}>
        <FormBody
          fields={cfg.fields}
          draft={draft}
          setDraft={setDraft}
          errors={errors}
          entrySlug={cfg.key}
          refs={refs}
        />
      </div>
    </>
  );
}
