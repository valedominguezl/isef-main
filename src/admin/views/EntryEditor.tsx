import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, ExternalLink, FileText, RotateCw, Save, Trash2, UserRound } from 'lucide-react';
import type { ZodTypeAny } from 'zod';
import CourseCard from '@/components/cards/CourseCard';
import NewsCard from '@/components/cards/NewsCard';
import SpeakerCard from '@/components/cards/SpeakerCard';
import type { Curso, Disertante, Novedad } from '@/content/schema';
import { useAdmin } from '../AdminContext';
import { getCollection, type Field, type QuickToggle } from '../config';
import { clean, FieldRenderer, Section, useDebounced, type Errors, type RefOption } from '../fields/Fields';
import { slugify } from '../image';
import { useEntries, useFile } from '../useEntries';
import { SkeletonForm, SkeletonHead } from './Skeleton';
import QuickToggles, { avisoDe } from './QuickToggles';
import { useLinkedQuick } from './useLinkedQuick';
import CvPdfImport from './CvPdfImport';
import Notice from './Notice';
import { Button } from '../ui/Button';
import DeleteButton from '../ui/DeleteButton';
import { useToast } from '../ui/Toaster';
import { novedadDeCurso } from '../novedadDeCurso';
import styles from '../Admin.module.scss';

type Obj = Record<string, unknown>;

export function validate(schema: ZodTypeAny, data: unknown): { ok: true; value: Obj } | { ok: false; errors: Errors } {
  // Campo faltante → mensaje propio; el resto usa el mensaje del esquema (o el de zod)
  const r = schema.safeParse(data, {
    error: (iss) => (iss.code === 'invalid_type' && iss.input === undefined ? 'Este campo es obligatorio' : undefined),
  });
  if (r.success) return { ok: true, value: r.data as Obj };
  const errors: Errors = {};
  for (const i of r.error.issues) {
    const key = i.path.join('.') || '_';
    errors[key] ??= i.message;
  }
  return { ok: false, errors };
}

/** Formulario genérico + barra de guardado. Reutilizado por colecciones y singletons. */
type FormProps = { fields: Field[]; draft: Obj; setDraft: (d: Obj) => void; errors: Errors; entrySlug: string; refs: Record<string, RefOption[]> };

/** Campos que ya se dibujan como sección propia (tarjeta con título). */
const isBlock = (f: Field) => f.type === 'group' || f.type === 'repeater' || f.type === 'section';

/**
 * Formulario: los campos sueltos consecutivos van juntos en una tarjeta; grupos, listas y secciones
 * son tarjetas con título. Así siempre se ve en qué bloque se está editando.
 */
const sectionHasError = (s: Extract<Field, { type: 'section' }>, errors: Errors) =>
  Object.keys(errors).some((k) => s.fields.some((c) => k === c.name || k.startsWith(`${c.name}.`)));

export function FormBody({ fields, draft, setDraft, errors, entrySlug, refs }: FormProps) {
  const render = (f: Field) =>
    f.type === 'section' ? (
      <Section
        key={f.name}
        title={f.label}
        help={f.help}
        collapsed={f.collapsed}
        // Si algún campo de adentro tiene error, la tarjeta se abre y se marca
        error={sectionHasError(f, errors) ? 'Hay campos para corregir en esta sección.' : undefined}
      >
        {f.fields.map(render)}
      </Section>
    ) : (
      <FieldRenderer key={f.name} field={f} value={draft[f.name]} onChange={(v) => setDraft({ ...draft, [f.name]: v })} errors={errors} path={f.name} entrySlug={entrySlug} refs={refs} />
    );
  const blocks: Field[][] = [];
  for (const f of fields) {
    const last = blocks[blocks.length - 1];
    if (!isBlock(f) && last && !isBlock(last[0])) last.push(f);
    else blocks.push([f]);
  }
  return (
    <div className={styles.form}>
      {blocks.map((b) =>
        isBlock(b[0]) ? (
          render(b[0])
        ) : (
          <div key={b[0].name} className={styles.fieldsCard}>
            {b.map(render)}
          </div>
        ),
      )}
    </div>
  );
}

/** Opciones para campos de referencia. `enabled=false` evita leer colecciones que el formulario no usa. */
export function useRefs(enabled = true) {
  const { entries: dis } = useEntries(enabled ? 'content/disertantes' : undefined);
  const { entries: cur } = useEntries(enabled ? 'content/cursos' : undefined);
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
  const toast = useToast();
  const refs = useRefs();
  const { data: loaded, error: loadError } = useFile(isNew || !col ? undefined : `${col.dir}/${slugParam}.json`);
  // Solo al crear: para no pisar una entrada que ya existe con el mismo título
  const { entries: existing } = useEntries(isNew ? col?.dir : undefined);
  // Novedades: para crear la vinculada a un curso nuevo y para borrarla junto con el curso
  const { entries: novedades } = useEntries(col?.key === 'cursos' ? 'content/novedades' : undefined);
  const cvCol = getCollection('cv')!;
  const isDis = key === 'disertantes';
  const { data: cvLoaded } = useFile(isDis && !isNew ? `content/cv/${slugParam}.json` : undefined);
  const tab = params.get('tab') === 'cv' && isDis ? 'cv' : 'main';

  const [draft, setDraft] = useState<Obj | null>(null);
  const [cvDraft, setCvDraft] = useState<Obj | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [dirty, setDirty] = useState(false);
  useUnsavedWarning(dirty);
  const linkedQuick = useLinkedQuick(col);
  // Si el archivo se relee mientras hay cambios sin guardar, no pisar lo que se está editando
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  });
  const shownSlug = useRef<string | null>(null);

  useEffect(() => {
    if (!col) return;
    if (isNew) {
      setDraft(col.defaults());
      setDirty(false);
      return;
    }
    if (loaded !== undefined) {
      if (dirtyRef.current && shownSlug.current === slugParam) return;
      setDraft(loaded ?? col.defaults());
      shownSlug.current = slugParam;
    }
    setDirty(false);
  }, [col, isNew, loaded, slugParam]);

  useEffect(() => {
    if (!isDis) return;
    if (isNew) setCvDraft(cvCol.defaults());
    else if (cvLoaded !== undefined) setCvDraft(cvLoaded ?? cvCol.defaults());
  }, [isDis, isNew, cvLoaded, cvCol]);

  // La dirección (URL) sale sola del título al crear y después no cambia: no se muestra
  const slug = isNew ? slugify(String(draft?.[col?.titleField ?? ''] ?? '')) : slugParam;

  const preview = useDebounced(draft, 200);
  if (!col) return <p>Colección desconocida.</p>;
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

  const title = String(draft[col.titleField] || '') || (isNew ? col.newLabel : slugParam);

  const update = (d: Obj) => {
    setDraft(d);
    setDirty(true);
  };

  const save = () => {
    const res = validate(col.schema, clean(draft));
    const cvRes = isDis && cvDraft ? validate(cvCol.schema, { ...(clean(cvDraft) as Obj), disertante: slug }) : null;
    // Errores del título por la dirección: sin letras ni números, o repetido con otra entrada
    const slugError = !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      ? 'Tiene que tener al menos una letra o número.'
      : isNew && existing?.some((e) => e.slug === slug)
        ? `Ya hay ${col.singular === 'novedad' ? 'una' : 'un'} ${col.singular} con este título. Cambialo un poco.`
        : null;
    if (!res.ok || (cvRes && !cvRes.ok) || slugError) {
      setErrors({
        ...(slugError && draft[col.titleField] ? { [col.titleField]: slugError } : {}),
        ...(res.ok ? {} : res.errors),
        ...(cvRes && !cvRes.ok ? Object.fromEntries(Object.entries(cvRes.errors).map(([k, v]) => [`cv:${k}`, v])) : {}),
      });
      if (cvRes && !cvRes.ok && res.ok && !slugError) setParams({ tab: 'cv' });
      else if (tab === 'cv') setParams({});
      return;
    }
    setErrors({});
    const titulo = String(res.value[col.titleField]);
    const changes = [{ path: `${col.dir}/${slug}.json`, content: `${JSON.stringify(clean(draft), null, 2)}\n`, encoding: 'utf8' as const, label: `${col.singular[0].toUpperCase()}${col.singular.slice(1)}: ${titulo}` }];
    if (cvRes?.ok) changes.push({ path: `content/cv/${slug}.json`, content: `${JSON.stringify({ disertante: slug, ...(clean(cvDraft) as Obj) }, null, 2)}\n`, encoding: 'utf8', label: `Currículum: ${titulo}` });
    // Curso nuevo → su novedad se crea sola, vinculada (si todavía no hay una para ese curso).
    // Solo con la lista de novedades cargada: si no, podría pisar una existente con el mismo nombre.
    const conNovedad = isNew && col.key === 'cursos' && novedades != null && !novedades.some((n) => n.slug === slug || n.data.curso === slug);
    stage(changes);
    // «Deshacer» del aviso quita solo la novedad: el curso guardado queda
    const undoNovedad = conNovedad
      ? stage([
          {
            path: `content/novedades/${slug}.json`,
            content: `${JSON.stringify(novedadDeCurso(slug, clean(draft) as Obj), null, 2)}\n`,
            encoding: 'utf8',
            label: `Novedad: ${titulo}`,
          },
        ])
      : undefined;
    setDirty(false);
    toast.saved(conNovedad ? 'Guardado. También se creó su novedad. Falta publicar.' : undefined, undoNovedad);
    if (isNew) navigate(`/admin/c/${col.key}/${slug}`, { replace: true });
  };

  const remove = () => {
    // Un curso se borra junto con su novedad (si no, la novedad apunta a un curso que no existe y no se
    // puede publicar). Las novedades de otra categoría que lo mencionan solo pierden el vínculo.
    if (col.key === 'cursos' && novedades == null) {
      toast.show({ text: 'Esperá un momento: todavía se están cargando las novedades.' });
      return;
    }
    const vinculadas = col.key === 'cursos' ? (novedades ?? []).filter((n) => n.data.curso === slugParam) : [];
    const undo = stage([
      { path: `${col.dir}/${slugParam}.json`, delete: true, label: `Eliminar ${col.singular}: ${title}` },
      ...(isDis ? [{ path: `content/cv/${slugParam}.json`, delete: true as const, label: `Eliminar currículum: ${title}` }] : []),
      ...vinculadas.map((n) => {
        const nombre = String(n.data.titulo ?? n.slug);
        if (n.data.categoria === 'curso') return { path: n.path, delete: true as const, label: `Eliminar novedad: ${nombre}` };
        const { curso: _curso, ...resto } = n.data;
        return { path: n.path, content: `${JSON.stringify(resto, null, 2)}\n`, encoding: 'utf8' as const, label: `Novedad: ${nombre}` };
      }),
    ]);
    setDirty(false);
    navigate(`/admin/c/${col.key}`);
    toast.show({ text: `Se eliminó «${title}». Falta publicar.`, icon: Trash2, undo });
  };

  /** Opción básica desde el editor: cambia el borrador (se guarda con Guardar) y se puede deshacer. */
  const toggleDraft = (q: QuickToggle, v: boolean) => {
    const prev = draft[q.name];
    update({ ...draft, [q.name]: v });
    toast.show({
      text: `${avisoDe(q, v, title)} Falta guardar.`,
      undo: () => setDraft((d) => (d ? { ...d, [q.name]: prev } : d)),
    });
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
            <ArrowLeft size={16} aria-hidden /> {col.label}
          </Link>
          <h1>{title}</h1>
        </div>
        {/* Eliminar queda aparte, separado de Ver en el sitio y Guardar */}
        <div className={styles.headActions}>
          {!isNew && (
            <>
              <DeleteButton what={title} consequence={`Se quita del sitio${isDis ? ' (con su currículum)' : ''} cuando publiques.`} onDelete={remove}>
                Eliminar
              </DeleteButton>
              <span className={styles.actionDivider} aria-hidden />
            </>
          )}
          {!isNew && col.sitePath && (
            <Button variant="ghost" icon={ExternalLink} href={col.sitePath(slugParam)}>
              Ver en el sitio
            </Button>
          )}
          <Button variant="primary" icon={Save} onClick={save}>
            Guardar
          </Button>
        </div>
      </div>

      {/* Opciones básicas (visible, destacado, este año…): lo primero que se ve */}
      {col.quick &&
        tab === 'main' &&
        (() => {
          const ln = linkedQuick(draft);
          return ln ? (
            <QuickToggles toggles={ln.toggles} data={ln.data} onChange={ln.onChange} sincronizado={ln.titulo} />
          ) : (
            <QuickToggles toggles={col.quick} data={draft} onChange={toggleDraft} />
          );
        })()}

      <Notice show={Object.keys(errors).length > 0} ok={false}>
        Hay {Object.keys(errors).length} campo(s) para corregir.
      </Notice>

      {isDis && (
        <div className={styles.tabs} role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'main'} onClick={() => setParams({})}>
            <UserRound size={18} aria-hidden /> Perfil
          </button>
          <button type="button" role="tab" aria-selected={tab === 'cv'} onClick={() => setParams({ tab: 'cv' })}>
            <FileText size={18} aria-hidden /> Currículum {Object.keys(cvErrors).length > 0 && <span className={styles.badge}>!</span>}
          </button>
        </div>
      )}

      <div className={styles.editor}>
        <div>
          {tab === 'cv' && cvDraft && (
            <CvPdfImport
              onImport={(cv) => {
                const prev = cvDraft;
                setCvDraft({ ...cvDraft, ...cv, disertante: slug });
                setDirty(true);
                return () => setCvDraft(prev);
              }}
              hasItems={((cvDraft.secciones as { items?: unknown[] }[] | undefined) ?? []).some((s) => s.items?.length)}
            />
          )}
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
            <p className={styles.previewLabel}>Así se ve en el sitio</p>
            <div className={styles.previewCard}>
              {col.preview === 'curso' && <CourseCard curso={card<Curso>({ disertantes: [], temario: [] }, 'imagen')} />}
              {col.preview === 'novedad' && <NewsCard novedad={card<Novedad>({}, 'imagen')} />}
              {col.preview === 'disertante' && <SpeakerCard disertante={card<Disertante>({ destacados: [] }, 'foto')} />}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
