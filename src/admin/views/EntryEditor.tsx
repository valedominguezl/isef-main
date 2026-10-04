import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Save, Trash2 } from 'lucide-react';
import type { ZodTypeAny } from 'zod';
import CourseCard from '@/components/cards/CourseCard';
import NewsCard from '@/components/cards/NewsCard';
import SpeakerCard from '@/components/cards/SpeakerCard';
import type { Curso, Disertante, Novedad } from '@/content/schema';
import { useAdmin } from '../AdminContext';
import { getCollection, type Field } from '../config';
import { clean, FieldRenderer, useDebounced, type Errors, type RefOption } from '../fields/Fields';
import { slugify } from '../image';
import { useEntries, useFile } from '../useEntries';
import styles from '../Admin.module.scss';

type Obj = Record<string, unknown>;

export function validate(schema: ZodTypeAny, data: unknown): { ok: true; value: Obj } | { ok: false; errors: Errors } {
  const r = schema.safeParse(data);
  if (r.success) return { ok: true, value: r.data as Obj };
  const errors: Errors = {};
  for (const i of r.error.issues) {
    const key = i.path.join('.') || '_';
    errors[key] ??= i.message === 'Required' ? 'Este campo es obligatorio' : i.message;
  }
  return { ok: false, errors };
}

/** Formulario genérico + barra de guardado. Reutilizado por colecciones y singletons. */
export function FormBody({ fields, draft, setDraft, errors, entrySlug, refs }: { fields: Field[]; draft: Obj; setDraft: (d: Obj) => void; errors: Errors; entrySlug: string; refs: Record<string, RefOption[]> }) {
  return (
    <div className={styles.form}>
      {fields.map((f) => (
        <FieldRenderer key={f.name} field={f} value={draft[f.name]} onChange={(v) => setDraft({ ...draft, [f.name]: v })} errors={errors} path={f.name} entrySlug={entrySlug} refs={refs} />
      ))}
    </div>
  );
}

export function useRefs() {
  const { entries: dis } = useEntries('content/disertantes');
  const { entries: cur } = useEntries('content/cursos');
  return useMemo(
    () => ({
      disertantes: (dis ?? []).map((d) => ({ value: d.slug, label: `${d.data.titulo ?? ''} ${d.data.nombre}`.trim() })),
      cursos: (cur ?? []).map((c) => ({ value: c.slug, label: String(c.data.titulo) })),
    }),
    [dis, cur],
  );
}

function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);
}

export default function EntryEditor() {
  const { key = '', slug: slugParam = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const col = getCollection(key);
  const isNew = slugParam === 'nueva';
  const navigate = useNavigate();
  const { stage, mediaUrl } = useAdmin();
  const refs = useRefs();
  const loaded = useFile(isNew || !col ? undefined : `${col.dir}/${slugParam}.json`);
  const cvCol = getCollection('cv')!;
  const isDis = key === 'disertantes';
  const cvLoaded = useFile(isDis && !isNew ? `content/cv/${slugParam}.json` : undefined);
  const tab = params.get('tab') === 'cv' && isDis ? 'cv' : 'main';

  const [draft, setDraft] = useState<Obj | null>(null);
  const [cvDraft, setCvDraft] = useState<Obj | null>(null);
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);

  useEffect(() => {
    if (!col) return;
    if (isNew) {
      setDraft(col.defaults());
      setSlug('');
    } else if (loaded !== undefined) {
      setDraft(loaded ?? col.defaults());
      setSlug(slugParam);
    }
    setDirty(false);
  }, [col, isNew, loaded, slugParam]);

  useEffect(() => {
    if (!isDis) return;
    if (isNew) setCvDraft(cvCol.defaults());
    else if (cvLoaded !== undefined) setCvDraft(cvLoaded ?? cvCol.defaults());
  }, [isDis, isNew, cvLoaded, cvCol]);

  // Slug automático a partir del título mientras sea nuevo
  useEffect(() => {
    if (isNew && !slugTouched && draft && col) setSlug(slugify(String(draft[col.titleField] ?? '')));
  }, [draft, isNew, slugTouched, col]);

  const preview = useDebounced(draft, 200);
  if (!col) return <p>Colección desconocida.</p>;
  if (!draft) return <p className={styles.help}>Cargando…</p>;

  const update = (d: Obj) => {
    setDraft(d);
    setDirty(true);
    setSaved(null);
  };

  const save = () => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setErrors({ _slug: 'La URL solo puede tener minúsculas, números y guiones.' });
      return;
    }
    const res = validate(col.schema, clean(draft));
    const cvRes = isDis && cvDraft ? validate(cvCol.schema, { ...(clean(cvDraft) as Obj), disertante: slug }) : null;
    if (!res.ok || (cvRes && !cvRes.ok)) {
      setErrors({ ...(res.ok ? {} : res.errors), ...(cvRes && !cvRes.ok ? Object.fromEntries(Object.entries(cvRes.errors).map(([k, v]) => [`cv:${k}`, v])) : {}) });
      if (cvRes && !cvRes.ok && res.ok) setParams({ tab: 'cv' });
      return;
    }
    setErrors({});
    const title = String(res.value[col.titleField]);
    const changes = [{ path: `${col.dir}/${slug}.json`, content: `${JSON.stringify(clean(draft), null, 2)}\n`, encoding: 'utf8' as const, label: `${col.singular[0].toUpperCase()}${col.singular.slice(1)}: ${title}` }];
    if (cvRes?.ok) changes.push({ path: `content/cv/${slug}.json`, content: `${JSON.stringify({ disertante: slug, ...(clean(cvDraft) as Obj) }, null, 2)}\n`, encoding: 'utf8', label: `Currículum: ${title}` });
    stage(changes);
    setDirty(false);
    setSaved('Guardado. Recordá tocar "Publicar" arriba a la derecha para que se vea en el sitio.');
    if (isNew) navigate(`/admin/c/${col.key}/${slug}`, { replace: true });
  };

  const remove = () => {
    if (!confirm(`¿Eliminar "${draft[col.titleField]}"? Se quitará del sitio al publicar.`)) return;
    stage([
      { path: `${col.dir}/${slugParam}.json`, delete: true, label: `Eliminar ${col.singular}: ${draft[col.titleField]}` },
      ...(isDis ? [{ path: `content/cv/${slugParam}.json`, delete: true as const, label: `Eliminar currículum: ${draft[col.titleField]}` }] : []),
    ]);
    navigate(`/admin/c/${col.key}`);
  };

  const cvErrors = Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith('cv:')).map(([k, v]) => [k.slice(3), v]));
  const mainErrors = Object.fromEntries(Object.entries(errors).filter(([k]) => !k.startsWith('cv:')));
  const p: Obj = { ...(clean(preview) as Obj), slug: slug || 'vista-previa' };
  const card = <T,>(defaults: Obj, imgKey: string) => ({ ...defaults, ...p, [imgKey]: mediaUrl(p[imgKey] as string | undefined) }) as unknown as T & { slug: string };

  return (
    <>
      <div className={styles.pageHead}>
        <div>
          <Link to={`/admin/c/${col.key}`} className={styles.back}>
            <ArrowLeft size={16} /> {col.label}
          </Link>
          <h1>{isNew ? col.newLabel : String(draft[col.titleField] || slugParam)}</h1>
        </div>
        <div className={styles.headActions}>
          {!isNew && col.sitePath && (
            <a href={col.sitePath(slugParam)} target="_blank" rel="noreferrer" className={styles.btnGhost}>
              <ExternalLink size={16} /> Ver en el sitio
            </a>
          )}
          {!isNew && (
            <button type="button" className={styles.btnDanger} onClick={remove}>
              <Trash2 size={16} /> Eliminar
            </button>
          )}
          <button type="button" className={styles.btnPrimary} onClick={save}>
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>

      {saved && <p className={styles.notice}>{saved}</p>}
      {Object.keys(errors).length > 0 && (
        <p className={styles.errorBox} role="alert">
          Hay {Object.keys(errors).length} campo(s) para corregir. {errors._slug ?? ''}
        </p>
      )}

      {isDis && (
        <div className={styles.tabs} role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'main'} onClick={() => setParams({})}>
            Perfil
          </button>
          <button type="button" role="tab" aria-selected={tab === 'cv'} onClick={() => setParams({ tab: 'cv' })}>
            Currículum normalizado {Object.keys(cvErrors).length > 0 && <span className={styles.badge}>!</span>}
          </button>
        </div>
      )}

      <div className={styles.editor}>
        <div>
          <div className={`${styles.field} ${styles.slugField}`}>
            <label className={styles.label} htmlFor="slug">
              URL
            </label>
            <div className={styles.slugRow}>
              <span>
                isefsanluis.net{col.sitePath?.('').replace(/\/$/, '/') ?? '/'}
              </span>
              <input
                id="slug"
                className={styles.input}
                value={slug}
                disabled={!isNew}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
              />
            </div>
            {!isNew && <p className={styles.help}>La URL no se puede cambiar para no romper enlaces compartidos.</p>}
          </div>
          {tab === 'cv' && cvDraft ? (
            <FormBody
              fields={cvCol.fields}
              draft={cvDraft}
              setDraft={(d) => {
                setCvDraft(d);
                setDirty(true);
              }}
              errors={cvErrors}
              entrySlug={slug}
              refs={refs}
            />
          ) : (
            <FormBody fields={col.fields} draft={draft} setDraft={update} errors={mainErrors} entrySlug={slug} refs={refs} />
          )}
        </div>
        {col.preview && (
          <aside className={styles.preview} aria-label="Vista previa">
            <p className={styles.previewLabel}>Vista previa</p>
            <div className={styles.previewCard}>
              {col.preview === 'curso' && <CourseCard curso={card<Curso>({ disertantes: [], temario: [] }, 'imagen')} />}
              {col.preview === 'novedad' && <NewsCard novedad={card<Novedad>({}, 'imagen')} />}
              {col.preview === 'disertante' && <SpeakerCard disertante={card<Disertante>({ destacados: [] }, 'foto')} />}
            </div>
            <p className={styles.help}>Así se verá la tarjeta en el sitio.</p>
          </aside>
        )}
      </div>
    </>
  );
}
