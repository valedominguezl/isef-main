import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Bold, ChevronDown, Eye, FileUp, ImagePlus, Italic, Link2, List, LoaderCircle, Pencil, Plus, RotateCcw, ScanSearch, Trash2, X } from 'lucide-react';
import { Markdown } from '@/lib/markdown';
import { useAdmin } from '../AdminContext';
import { processImage, blobToBase64, slugify } from '../image';
import type { Field } from '../config';
import { Button, IconButton } from '../ui/Button';
import DeleteButton from '../ui/DeleteButton';
import StockPhotoPicker from './StockPhotoPicker';
import Combobox from './Combobox';
import ConVistaPrevia, { type PaginaVista } from './VistaPrevia';
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
  /** Editor de una página: cada bloque (grupo de primer nivel) lleva su vista previa al lado. */
  pagePreview?: PaginaVista;
}

/** Contenido plegable con animación de altura (grid 0fr → 1fr). Se monta al abrir por primera vez. */
function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);
  return (
    <div className={styles.collapse} data-open={open || undefined} inert={!open}>
      <div className={styles.collapseInner}>{mounted && children}</div>
    </div>
  );
}

/** Profundidad de anidamiento según la ruta del campo ("secciones.0.items.2.titulo" → 2). */
const depthOf = (path: string) => path.split('.').filter((p) => /^\d+$/.test(p)).length;

const esObligatorio = (field: Field) => 'required' in field && Boolean(field.required);

/**
 * Atributos de accesibilidad del control de un campo: la ayuda y el error quedan conectados
 * (aria-describedby), y el lector de pantalla sabe si es obligatorio o si tiene un error.
 */
function a11yDe(id: string, field: Field, error?: string) {
  const describedBy = [field.help && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return { 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, 'aria-required': esObligatorio(field) || undefined };
}

/**
 * Etiqueta + control + ayuda + error. Con `htmlFor` la etiqueta apunta al control; sin él (foto, archivo,
 * listas, chips) el contenido va en un grupo con nombre (role="group" + aria-labelledby).
 * El error no es role="alert": al guardar se leería uno por campo; el resumen lo anuncia el aviso de arriba.
 */
function Wrapper({ id, field, error, children, htmlFor, counter }: { id: string; field: Field; error?: string; children: ReactNode; htmlFor?: string; counter?: ReactNode }) {
  const marca = esObligatorio(field) && <span aria-hidden> *</span>;
  return (
    <div className={[styles.field, error && styles.fieldError].filter(Boolean).join(' ')}>
      <div className={styles.labelRow}>
        {htmlFor ? (
          <label htmlFor={htmlFor} className={styles.label}>
            {field.label}
            {marca}
          </label>
        ) : (
          <span id={`${id}-etiqueta`} className={styles.label}>
            {field.label}
            {marca}
          </span>
        )}
        {counter}
      </div>
      {htmlFor ? (
        children
      ) : (
        <div role="group" aria-labelledby={`${id}-etiqueta`} {...a11yDe(id, field, error)} aria-invalid={undefined}>
          {children}
        </div>
      )}
      {field.help && (
        <p id={`${id}-ayuda`} className={styles.help}>
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

function MarkdownEditor({
  id,
  value,
  onChange,
  rows = 6,
  placeholder,
  a11y,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  a11y?: ReturnType<typeof a11yDe>;
}) {
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
        <textarea id={id} ref={ref} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={styles.input} {...a11y} />
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
      <div className={styles.imagePreview} style={field.aspect ? { aspectRatio: String(field.aspect) } : undefined} aria-busy={busy || undefined}>
        {/* key: la foto nueva entra con un fundido corto en vez de aparecer de golpe */}
        {src ? <img key={src} src={src} alt="" className={styles.imgFade} /> : <ImagePlus size={28} aria-hidden />}
        {busy && (
          <span className={styles.stockBusy}>
            <LoaderCircle size={28} className={styles.spin} aria-hidden />
          </span>
        )}
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
        {err && (
          <p className={styles.error} role="alert">
            {err}
          </p>
        )}
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
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      )}
    </div>
  );
}

/* ───────────── Identidad estable de los ítems de una lista ─────────────
 * Con key={índice}, al subir/bajar el contenido se intercambiaba en el lugar: lo abierto/cerrado y el
 * foco se quedaban en la posición vieja. Cada ítem lleva un id propio que viaja con él.
 */
let ultimoId = 0;
const nuevoId = () => ++ultimoId;

function useIds(n: number) {
  const [ids, setIds] = useState(() => Array.from({ length: n }, nuevoId));
  // Cambios que no pasan por acá (Deshacer, Restaurar, otro editor): se completa o recorta al final
  if (ids.length !== n) setIds((k) => (k.length < n ? [...k, ...Array.from({ length: n - k.length }, nuevoId)] : k.slice(0, n)));
  const swap = (i: number, d: number) =>
    setIds((k) => {
      const next = [...k];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
  const removeAt = (i: number) => setIds((k) => k.filter((_, j) => j !== i));
  const insertAt = (i: number) => {
    const id = nuevoId();
    setIds((k) => [...k.slice(0, i), id, ...k.slice(i)]);
    return id;
  };
  return { ids, swap, removeAt, insertAt };
}

/** Subir/Bajar: en la punta queda aria-disabled (no disabled) para que el foco no se caiga al body. */
function MoveButtons({ i, total, onMove }: { i: number; total: number; onMove: (i: number, d: number) => void }) {
  return (
    <>
      <IconButton icon={ArrowUp} label="Subir" aria-disabled={i === 0 || undefined} onClick={() => i > 0 && onMove(i, -1)} />
      <IconButton icon={ArrowDown} label="Bajar" aria-disabled={i === total - 1 || undefined} onClick={() => i < total - 1 && onMove(i, 1)} />
    </>
  );
}

function ListField({ value, onChange, itemLabel = 'elemento', max }: { value: string[]; onChange: (v: unknown) => void; itemLabel?: string; max?: number }) {
  const { ids, swap, removeAt, insertAt } = useIds(value.length);
  const [nuevos, setNuevos] = useState<Set<number>>(() => new Set());
  const set = (i: number, v: string) => onChange(value.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    swap(i, d);
    onChange(next);
  };
  return (
    <div className={styles.list}>
      {value.map((v, i) => (
        <div key={ids[i] ?? `i${i}`} className={[styles.listRow, nuevos.has(ids[i]) && styles.resultIn].filter(Boolean).join(' ')}>
          <input className={styles.input} value={v} onChange={(e) => set(i, e.target.value)} aria-label={`${itemLabel} ${i + 1}`} />
          <MoveButtons i={i} total={value.length} onMove={move} />
          <IconButton
            icon={X}
            label={`Quitar ${itemLabel}`}
            onClick={() => {
              removeAt(i);
              onChange(value.filter((_, j) => j !== i));
            }}
          />
        </div>
      ))}
      {(!max || value.length < max) && (
        <Button
          variant="ghost"
          icon={Plus}
          onClick={() => {
            const id = insertAt(value.length);
            setNuevos((s) => new Set(s).add(id));
            onChange([...value, '']);
          }}
        >
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
  const { ids, swap, removeAt, insertAt } = useIds(items.length);
  const latest = useRef({ items, onChange, insertAt });
  useEffect(() => {
    latest.current = { items, onChange, insertAt };
  });
  // Abierto/cerrado por id (no por posición): acompaña al ítem cuando se mueve o se borra otro
  const [open, setOpen] = useState<Set<number>>(() => new Set(field.collapsed ? [] : ids));
  const [nuevos, setNuevos] = useState<Set<number>>(() => new Set());
  const toggle = (id: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    swap(i, d);
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
    const estabaAbierto = open.has(ids[i]);
    removeAt(i);
    onChange(items.filter((_, j) => j !== i));
    toast.show({
      text: `Se quitó «${title}». Falta guardar.`,
      icon: Trash2,
      undo: () => {
        const { items: cur, onChange: set, insertAt: insertar } = latest.current;
        const id = insertar(i);
        if (estabaAbierto) setOpen((s) => new Set(s).add(id));
        set([...cur.slice(0, i), removed, ...cur.slice(i)]);
      },
    });
  };
  const nested = depthOf(path) > 0;
  return (
    <div className={[styles.repeater, nested && styles.repNested].filter(Boolean).join(' ')}>
      {items.map((it, i) => {
        const id = ids[i];
        // Un ítem con error se muestra abierto (si no, el error queda escondido)
        const hasErr = Object.keys(errors).some((k) => k.startsWith(`${path}.${i}.`));
        const isOpen = open.has(id) || hasErr;
        return (
          <div
            key={id ?? `i${i}`}
            className={[styles.repItem, isOpen && styles.repOpen, hasErr && styles.repError, nuevos.has(id) && styles.resultIn].filter(Boolean).join(' ')}
          >
            <div className={styles.repHead}>
              <button type="button" className={styles.repToggle} onClick={() => toggle(id)} aria-expanded={isOpen}>
                <ChevronDown size={18} className={styles.chevron} aria-hidden />
                <span>
                  {titleOf(it, i)}
                  <small>{count(it)}</small>
                </span>
              </button>
              <MoveButtons i={i} total={items.length} onMove={move} />
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
          const id = insertAt(items.length);
          setOpen((s) => new Set(s).add(id));
          setNuevos((s) => new Set(s).add(id));
          onChange([...items, {}]);
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
  const a = a11yDe(id, field, error);

  switch (field.type) {
    case 'text':
    case 'url':
    case 'email':
      if (field.type === 'text' && field.sugerencias)
        return (
          <Wrapper id={id} field={field} error={error} htmlFor={id}>
            <Combobox id={id} value={str} onChange={onChange} opciones={(refs[field.sugerencias] ?? []).map((o) => o.label)} placeholder={field.placeholder} a11y={a} />
          </Wrapper>
        );
      return (
        <Wrapper id={id} field={field} error={error} htmlFor={id} counter={field.max ? <Counter n={str.length} max={field.max} /> : null}>
          <input
            id={id}
            type={field.type === 'text' ? 'text' : field.type}
            className={styles.input}
            value={str}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            {...a}
          />
        </Wrapper>
      );
    case 'textarea':
      return (
        <Wrapper id={id} field={field} error={error} htmlFor={id} counter={field.max ? <Counter n={str.length} max={field.max} /> : null}>
          <textarea id={id} rows={field.rows ?? 4} className={styles.input} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} {...a} />
        </Wrapper>
      );
    case 'markdown':
      return (
        <Wrapper id={id} field={field} error={error} htmlFor={id}>
          <MarkdownEditor id={id} value={str} onChange={onChange} rows={field.rows} placeholder={field.placeholder} a11y={a} />
        </Wrapper>
      );
    case 'number':
      return (
        <Wrapper id={id} field={field} error={error} htmlFor={id}>
          <input
            id={id}
            type="number"
            step={field.step ?? 1}
            className={styles.input}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            {...a}
          />
        </Wrapper>
      );
    case 'date':
      return (
        <Wrapper id={id} field={field} error={error} htmlFor={id}>
          <input id={id} type="date" className={styles.input} value={str} onChange={(e) => onChange(e.target.value || undefined)} {...a} />
        </Wrapper>
      );
    case 'boolean':
      return (
        <div className={styles.switchRow}>
          <input
            id={id}
            type="checkbox"
            role="switch"
            className={styles.switch}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            aria-describedby={field.help ? `${id}-ayuda` : undefined}
          />
          <label htmlFor={id}>{field.label}</label>
          {field.help && (
            <p id={`${id}-ayuda`} className={styles.help}>
              {field.help}
            </p>
          )}
        </div>
      );
    case 'select':
      return (
        <Wrapper id={id} field={field} error={error} htmlFor={id}>
          <select id={id} className={styles.input} value={str} onChange={(e) => onChange(e.target.value)} {...a}>
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
        <Wrapper id={id} field={field} error={error}>
          <ImageField field={field} value={value as string | undefined} onChange={onChange} entrySlug={entrySlug} />
        </Wrapper>
      );
    case 'file':
      return (
        <Wrapper id={id} field={field} error={error}>
          <FileField field={field} value={value as string | undefined} onChange={onChange} />
        </Wrapper>
      );
    case 'list':
      return (
        <Wrapper id={id} field={field} error={error}>
          <ListField value={(value as string[]) ?? []} onChange={onChange} itemLabel={field.itemLabel} max={field.max} />
        </Wrapper>
      );
    case 'reference': {
      const options = refs[field.collection] ?? [];
      if (!field.multiple)
        return (
          <Wrapper id={id} field={field} error={error} htmlFor={id}>
            <select id={id} className={styles.input} value={str} onChange={(e) => onChange(e.target.value || undefined)} {...a}>
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
        <Wrapper id={id} field={field} error={error}>
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
        <Wrapper id={id} field={field} error={error}>
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
          {/* Sin role="alert": el resumen de errores lo anuncia el aviso de arriba al guardar */}
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </Collapse>
    </section>
  );
}

function GroupField(props: FieldProps & { field: Extract<Field, { type: 'group' }> }) {
  const { field, value, onChange, errors, path, entrySlug, refs, pagePreview } = props;
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
        {pagePreview ? (
          <ConVistaPrevia {...pagePreview} bloque={field.name} datos={obj}>
            {body}
          </ConVistaPrevia>
        ) : (
          body
        )}
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
