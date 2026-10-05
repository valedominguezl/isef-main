import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Bold, ChevronDown, Eye, FileUp, ImagePlus, Italic, Link2, List, LoaderCircle, Pencil, Plus, RotateCcw, ScanSearch, Trash2, X } from 'lucide-react';
import { Markdown } from '@/lib/markdown';
import { useAdmin } from '../AdminContext';
import { processImage, blobToBase64, slugify } from '../image';
import type { Field } from '../config';
import { Button, IconButton } from '../ui/Button';
import DeleteButton from '../ui/DeleteButton';
import StockPhotoPicker from './StockPhotoPicker';
import { useToast } from '../ui/Toaster';
import styles from '../Admin.module.scss';

export type Errors = Record<string, string>;
type Obj = Record<string, unknown>;

export interface RefOption {
  value: string;
  label: string;
}

interface FieldProps {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  errors: Errors;
  path: string;
  /** Slug de la entrada (para nombrar archivos subidos). */
  entrySlug: string;
  refs: Record<string, RefOption[]>;
}

/** Contenido plegable con animación de altura (grid 0fr → 1fr). Se monta al abrir por primera vez. */
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  return (
    <div className={styles.collapse} data-open={open || undefined} {...(!open && { inert: '' })}>
      <div className={styles.collapseInner}>{mounted && children}</div>
    </div>
  );
}

/** Profundidad de anidamiento según la ruta del campo ("secciones.0.items.2.titulo" → 2). */
const depthOf = (path: string) => path.split('.').filter((p) => /^\d+$/.test(p)).length;

function Wrapper({ field, error, children, htmlFor, counter }: { field: Field; error?: string; children: ReactNode; htmlFor?: string; counter?: ReactNode }) {
  return (
    <div className={[styles.field, error && styles.fieldError].filter(Boolean).join(' ')}>
      <div className={styles.labelRow}>
        <label htmlFor={htmlFor} className={styles.label}>
          {field.label}
          {'required' in field && field.required && <span aria-hidden> *</span>}
        </label>
        {counter}
      </div>
      {children}
      {field.help && <p className={styles.help}>{field.help}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function MarkdownEditor({ id, value, onChange, rows = 6, placeholder }: { id: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const wrap = (before: string, after = before, placeholder = 'texto') => {
    const ta = ref.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  return (
    <div className={styles.md}>
      <div className={styles.mdToolbar} role="toolbar" aria-label="Formato">
        <IconButton icon={Bold} label="Negrita" onClick={() => wrap('**')} disabled={preview} />
        <IconButton icon={Italic} label="Cursiva" onClick={() => wrap('_')} disabled={preview} />
        <IconButton icon={Link2} label="Enlace" onClick={() => wrap('[', '](https://)', 'texto del enlace')} disabled={preview} />
        <IconButton icon={List} label="Lista" onClick={() => wrap('\n- ', '', 'elemento')} disabled={preview} />
        <button type="button" className={preview ? styles.on : undefined} onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
          {preview ? <Pencil size={16} aria-hidden /> : <Eye size={16} aria-hidden />} {preview ? 'Editar' : 'Ver cómo queda'}
        </button>
      </div>
      {preview ? (
        <div className={styles.mdPreview}>{value || placeholder ? <Markdown text={value || placeholder || ''} /> : <p className={styles.help}>(vacío)</p>}</div>
      ) : (
        <textarea id={id} ref={ref} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={styles.input} />
      )}
    </div>
  );
}

function ImageField({ field, value, onChange, entrySlug }: { field: Extract<Field, { type: 'image' }>; value: string | undefined; onChange: (v: unknown) => void; entrySlug: string }) {
  const { stage, mediaUrl } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Buscador de fotos de stock: null = cerrado; si no, la búsqueda con la que abre
  const [buscar, setBuscar] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  /** Mismo camino para una foto subida o una de stock: recorte/redimensión → WebP → cambio pendiente. */
  const procesar = async (foto: Blob, nombre: string) => {
    const img = await processImage(foto, { maxWidth: field.maxWidth, aspect: field.aspect });
    const base = slugify(entrySlug || nombre) || 'imagen';
    const name = `${base}-${Date.now().toString(36)}.webp`;
    const path = `/media/${field.folder}/${name}`;
    stage([{ path: `public${path}`, content: img.base64, encoding: 'base64', label: `Imagen ${name} (${Math.round(img.size / 1024)} KB)` }]);
    onChange(path);
  };
  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      await procesar(file, file.name.replace(/\.[^.]+$/, ''));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };
  // Sin foto propia: se muestra la que usa hoy el sitio (si el campo la conoce)
  const src = mediaUrl(value) ?? field.actual;
  const esActual = !value && Boolean(field.actual);
  return (
    <div className={styles.image}>
      <div className={styles.imagePreview} style={field.aspect ? { aspectRatio: String(field.aspect) } : undefined}>
        {src ? <img src={src} alt="" /> : <ImagePlus size={28} aria-hidden />}
      </div>
      <div className={styles.imageActions}>
        {esActual && <p className={styles.help}>Foto actual del sitio.</p>}
        <Button variant="secondary" icon={busy ? LoaderCircle : ImagePlus} spin={busy} disabled={busy} onClick={() => input.current?.click()}>
          {busy ? 'Procesando…' : value || esActual ? 'Cambiar foto' : 'Subir foto'}
        </Button>
        <input ref={input} type="file" accept="image/*" hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
        <Button variant="secondary" icon={ScanSearch} disabled={busy} onClick={() => setBuscar('')}>
          Buscar foto gratis
        </Button>
        {value && (
          <Button variant="ghost" icon={field.actual ? RotateCcw : X} onClick={() => onChange(undefined)}>
            {field.actual ? 'Volver a la foto original' : 'Quitar foto'}
          </Button>
        )}
        {err && <p className={styles.error}>{err}</p>}
      </div>
      <StockPhotoPicker open={buscar !== null} query={buscar ?? ''} onClose={() => setBuscar(null)} onPick={(foto) => procesar(foto, 'foto')} />
    </div>
  );
}

function FileField({ field, value, onChange }: { field: Extract<Field, { type: 'file' }>; value: string | undefined; onChange: (v: unknown) => void }) {
  const { stage } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const onFile = async (file?: File) => {
    if (!file) return;
    if (input.current) input.current.value = '';
    const name = `${slugify(file.name.replace(/\.[^.]+$/, ''))}${file.name.match(/\.[^.]+$/)?.[0]?.toLowerCase() ?? ''}`;
    const path = `/${field.folder}/${name}`;
    stage([{ path: `public${path}`, content: await blobToBase64(file), encoding: 'base64', label: `Archivo ${name}` }]);
    onChange(path);
  };
  return (
    <div className={styles.fileRow}>
      <Button variant="secondary" icon={FileUp} onClick={() => input.current?.click()}>
        {value ? 'Reemplazar archivo' : 'Subir archivo'}
      </Button>
      <input ref={input} type="file" accept={field.accept} hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0])} />
      {value && (
        <a href={value} target="_blank" rel="noreferrer" className={styles.path}>
          {value}
        </a>
      )}
    </div>
  );
}

function ListField({ value, onChange, itemLabel = 'elemento', max }: { value: string[]; onChange: (v: unknown) => void; itemLabel?: string; max?: number }) {
  const set = (i: number, v: string) => onChange(value.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className={styles.list}>
      {value.map((v, i) => (
        <div key={i} className={styles.listRow}>
          <input className={styles.input} value={v} onChange={(e) => set(i, e.target.value)} aria-label={`${itemLabel} ${i + 1}`} />
          <IconButton icon={ArrowUp} label="Subir" disabled={i === 0} onClick={() => move(i, -1)} />
          <IconButton icon={ArrowDown} label="Bajar" disabled={i === value.length - 1} onClick={() => move(i, 1)} />
          <IconButton icon={X} label={`Quitar ${itemLabel}`} onClick={() => onChange(value.filter((_, j) => j !== i))} />
        </div>
      ))}
      {(!max || value.length < max) && (
        <Button variant="ghost" icon={Plus} onClick={() => onChange([...value, ''])}>
          Agregar {itemLabel}
        </Button>
      )}
    </div>
  );
}

function Repeater(props: FieldProps & { field: Extract<Field, { type: 'repeater' }> }) {
  const { field, onChange, errors, path, entrySlug, refs } = props;
  const items = (Array.isArray(props.value) ? props.value : []) as Obj[];
  const toast = useToast();
  // "Deshacer" corre unos segundos después: usa la lista y el onChange del último render, no los de cuando se borró
  const latest = useRef({ items, onChange });
  latest.current = { items, onChange };
  const [open, setOpen] = useState<Set<number>>(() => new Set(field.collapsed ? [] : items.map((_, i) => i)));
  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const titleOf = (it: Obj, i: number) => {
    const raw = field.titleField ? it[field.titleField] : undefined;
    const sel = field.fields.find((f) => f.name === field.titleField);
    const label = sel?.type === 'select' ? sel.options.find((o) => o.value === raw)?.label : raw;
    return (label as string) || `${field.itemLabel} ${i + 1}`;
  };
  const count = (it: Obj) => {
    const arr = Object.values(it).find(Array.isArray) as unknown[] | undefined;
    return arr ? ` · ${arr.length}` : '';
  };
  const remove = (i: number) => {
    const removed = items[i];
    const title = titleOf(removed, i);
    onChange(items.filter((_, j) => j !== i));
    setOpen((s) => new Set([...s].filter((j) => j !== i).map((j) => (j > i ? j - 1 : j))));
    toast.show({
      text: `Se quitó «${title}». Falta guardar.`,
      icon: Trash2,
      undo: () => {
        const { items: cur, onChange: set } = latest.current;
        set([...cur.slice(0, i), removed, ...cur.slice(i)]);
      },
    });
  };
  const nested = depthOf(path) > 0;
  return (
    <div className={[styles.repeater, nested && styles.repNested].filter(Boolean).join(' ')}>
      {items.map((it, i) => {
        const isOpen = open.has(i);
        const hasErr = Object.keys(errors).some((k) => k.startsWith(`${path}.${i}.`));
        return (
          <div key={i} className={[styles.repItem, isOpen && styles.repOpen, hasErr && styles.repError].filter(Boolean).join(' ')}>
            <div className={styles.repHead}>
              <button type="button" className={styles.repToggle} onClick={() => toggle(i)} aria-expanded={isOpen}>
                <ChevronDown size={18} className={styles.chevron} />
                <span>
                  {titleOf(it, i)}
                  <small>{count(it)}</small>
                </span>
              </button>
              <IconButton icon={ArrowUp} label="Subir" disabled={i === 0} onClick={() => move(i, -1)} />
              <IconButton icon={ArrowDown} label="Bajar" disabled={i === items.length - 1} onClick={() => move(i, 1)} />
              <DeleteButton
                what={titleOf(it, i)}
                consequence="Se quita de la lista. El cambio queda al tocar Guardar."
                // Recién agregado y vacío: se quita sin preguntar
                ask={Object.keys(clean(it) as Obj).length > 0}
                onDelete={() => remove(i)}
              />
            </div>
            <Collapse open={isOpen}>
              <div className={styles.repBody}>
                {field.fields.map((f) => (
                  <FieldRenderer
                    key={f.name}
                    field={f}
                    value={it[f.name]}
                    onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...x, [f.name]: v } : x)))}
                    errors={errors}
                    path={`${path}.${i}.${f.name}`}
                    entrySlug={entrySlug}
                    refs={refs}
                  />
                ))}
              </div>
            </Collapse>
          </div>
        );
      })}
      <Button
        variant="ghost"
        icon={Plus}
        onClick={() => {
          onChange([...items, {}]);
          setOpen((s) => new Set(s).add(items.length));
        }}
      >
        Agregar {field.itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}

export function FieldRenderer(props: FieldProps) {
  const { field, value, onChange, errors, path, entrySlug, refs } = props;
  const id = useId();
  const error = errors[path];
  const str = (value as string | undefined) ?? '';

  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
      return (
        <Wrapper field={field} error={error} htmlFor={id} counter={field.max ? <Counter n={str.length} max={field.max} /> : null}>
          <input id={id} type={field.type === 'text' ? 'text' : field.type} className={styles.input} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </Wrapper>
      );
    case 'textarea':
      return (
        <Wrapper field={field} error={error} htmlFor={id} counter={field.max ? <Counter n={str.length} max={field.max} /> : null}>
          <textarea id={id} rows={field.rows ?? 4} className={styles.input} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
        </Wrapper>
      );
    case 'markdown':
      return (
        <Wrapper field={field} error={error} htmlFor={id}>
          <MarkdownEditor id={id} value={str} onChange={onChange} rows={field.rows} placeholder={field.placeholder} />
        </Wrapper>
      );
    case 'number':
      return (
        <Wrapper field={field} error={error} htmlFor={id}>
          <input
            id={id}
            type="number"
            step={field.step ?? 1}
            className={styles.input}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </Wrapper>
      );
    case 'date':
      return (
        <Wrapper field={field} error={error} htmlFor={id}>
          <input id={id} type="date" className={styles.input} value={str} onChange={(e) => onChange(e.target.value || undefined)} />
        </Wrapper>
      );
    case 'boolean':
      return (
        <div className={styles.switchRow}>
          <input id={id} type="checkbox" role="switch" className={styles.switch} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <label htmlFor={id}>{field.label}</label>
          {field.help && <p className={styles.help}>{field.help}</p>}
        </div>
      );
    case 'select':
      return (
        <Wrapper field={field} error={error} htmlFor={id}>
          <select id={id} className={styles.input} value={str} onChange={(e) => onChange(e.target.value)}>
            {!field.required && !field.options.some((o) => o.value === '') && <option value="">—</option>}
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Wrapper>
      );
    case 'image':
      return (
        <Wrapper field={field} error={error}>
          <ImageField field={field} value={value as string | undefined} onChange={onChange} entrySlug={entrySlug} />
        </Wrapper>
      );
    case 'file':
      return (
        <Wrapper field={field} error={error}>
          <FileField field={field} value={value as string | undefined} onChange={onChange} />
        </Wrapper>
      );
    case 'list':
      return (
        <Wrapper field={field} error={error}>
          <ListField value={(value as string[]) ?? []} onChange={onChange} itemLabel={field.itemLabel} max={field.max} />
        </Wrapper>
      );
    case 'reference': {
      const options = refs[field.collection] ?? [];
      if (!field.multiple)
        return (
          <Wrapper field={field} error={error} htmlFor={id}>
            <select id={id} className={styles.input} value={str} onChange={(e) => onChange(e.target.value || undefined)}>
              <option value="">— Ninguno —</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Wrapper>
        );
      const sel = (value as string[]) ?? [];
      return (
        <Wrapper field={field} error={error}>
          <div className={styles.chips}>
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                aria-pressed={sel.includes(o.value)}
                onClick={() => onChange(sel.includes(o.value) ? sel.filter((s) => s !== o.value) : [...sel, o.value])}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Wrapper>
      );
    }
    case 'group':
      return <GroupField {...props} field={field} />;
    case 'section':
      return null; // la arma FormBody (agrupa campos del mismo nivel)
    case 'repeater':
      // Una lista de primer nivel es una sección del formulario; anidada, un campo más
      return depthOf(path) === 0 && !path.includes('.') ? (
        <Section title={field.label} help={field.help} error={error}>
          <Repeater {...props} field={field} />
        </Section>
      ) : (
        <Wrapper field={field} error={error}>
          <Repeater {...props} field={field} />
        </Wrapper>
      );
  }
}

/** Sección del formulario: tarjeta con título claro, plegable. */
export function Section({ title, help, error, collapsed, children }: { title: string; help?: string; error?: string; collapsed?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(!collapsed);
  useEffect(() => {
    if (error) setOpen(true);
  }, [error]);
  return (
    <section className={[styles.section, open && styles.sectionOpen, error && styles.repError].filter(Boolean).join(' ')}>
      <button type="button" className={styles.sectionHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          <strong>{title}</strong>
          {help && <small>{help}</small>}
        </span>
        <ChevronDown size={20} className={styles.chevron} />
      </button>
      <Collapse open={open}>
        <div className={styles.sectionBody}>
          {children}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </Collapse>
    </section>
  );
}

function GroupField(props: FieldProps & { field: Extract<Field, { type: 'group' }> }) {
  const { field, value, onChange, errors, path, entrySlug, refs } = props;
  const obj = (value as Obj | undefined) ?? {};
  const body = field.fields.map((f) => (
    <FieldRenderer
      key={f.name}
      field={f}
      value={obj[f.name]}
      onChange={(v) => onChange({ ...obj, [f.name]: v })}
      errors={errors}
      path={`${path}.${f.name}`}
      entrySlug={entrySlug}
      refs={refs}
    />
  ));
  // Grupo de primer nivel: sección plegable. Dentro de una lista: recuadro simple con título.
  if (!path.includes('.'))
    return (
      <Section title={field.label} help={field.help} collapsed={field.collapsed}>
        {body}
      </Section>
    );
  return (
    <fieldset className={styles.group}>
      <legend>{field.label}</legend>
      {field.help && <p className={styles.help}>{field.help}</p>}
      {body}
    </fieldset>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={[styles.counter, n > max && styles.over].filter(Boolean).join(' ')}>{`${n}/${max}`}</span>;
}

/** Elimina strings vacíos, null y objetos opcionales vacíos antes de validar/guardar. */
export function clean(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(clean).filter((x) => x !== undefined && !(typeof x === 'string' && x.trim() === ''));
  if (v && typeof v === 'object') {
    const out: Obj = {};
    for (const [k, val] of Object.entries(v)) {
      const c = clean(val);
      if (c === undefined || c === null || (typeof c === 'string' && c.trim() === '')) continue;
      if (c && typeof c === 'object' && !Array.isArray(c) && !Object.keys(c).length) continue;
      out[k] = typeof c === 'string' ? c.replace(/\r\n/g, '\n') : c;
    }
    return out;
  }
  return v;
}

/** Mismo hook que el sitio (antes había una copia acá). */
export { useDebounced } from '@/lib/useDebounced';
