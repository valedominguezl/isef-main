import { useCallback, useEffect, useRef, useState, type InputHTMLAttributes } from 'react';
import { CheckCircle2, Download, Eye, Mail, MailWarning, Pencil, RotateCcw, RotateCw, Search, Send, Square } from 'lucide-react';
import { normalize } from '@/lib/format';
import type { Certificado } from '@/content/schema';
import { useAdmin } from '../AdminContext';
import type { Emitido, RespuestasForm } from '../api';
import { Button, IconButton } from '../ui/Button';
import Modal from '../ui/Modal';
import { useConfirm } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toaster';
import { armarPersonas, conAjuste, estadoDe, guardarAjustes, idFormulario, leerAjustes, type Ajuste, type Estado, type Persona } from './datos';
import { aBase64, generarCertificado } from './pdf';
import { ASUNTO, completar, MENSAJE, nombreArchivo, notaTexto, nuevoCodigo } from './texto';
import Vista from './Vista';
import { useFirma } from './firma';
import adm from '../Admin.module.scss';
import s from './Certificados.module.scss';

type Filtro = 'todos' | 'pendientes' | 'enviados' | 'no-aprobados';

const ESTADO: Record<Estado, { texto: string; cls: string }> = {
  enviado: { texto: 'Enviado', cls: s.ok },
  emitido: { texto: 'Descargado', cls: s.info },
  pendiente: { texto: 'Pendiente', cls: s.pend },
  'no-aprobado': { texto: 'No aprobó', cls: s.gris },
  'sin-mail': { texto: 'Sin mail válido', cls: s.alerta },
};

const fechaHora = (iso: string) => new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Texto de la actividad para el registro y la página de verificación. */
const actividadDe = (c: Certificado) => [c.programa?.trim(), c.actividad.replace(/[«»]/g, '').trim()].filter(Boolean).join(' · ');

/**
 * Personas que completaron el formulario → vista previa, corrección y envío del certificado por mail.
 * Gmail (cuenta común) deja mandar 100 por día: un envío masivo se corta ahí y el resto queda pendiente.
 */
export default function Envios({ cert, slug }: { cert: Certificado; slug: string }) {
  const { api } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const form = idFormulario(cert.formulario);
  const { firma, version: firmaVersion } = useFirma(api);

  const [respuestas, setRespuestas] = useState<RespuestasForm | null>(null);
  const [emitidos, setEmitidos] = useState<Emitido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cuota, setCuota] = useState<number | null>(null);
  const [ajustes, setAjustes] = useState(() => leerAjustes(slug));
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [q, setQ] = useState('');
  const [enCurso, setEnCurso] = useState<Set<string>>(new Set());
  const [fallas, setFallas] = useState<Record<string, string>>({});
  const [lote, setLote] = useState<{ hechos: number; total: number } | null>(null);
  const detener = useRef(false);
  const [vista, setVista] = useState<Persona | null>(null);
  const [editando, setEditando] = useState<Persona | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [r, e] = await Promise.all([api.certRespuestas(form), api.certEmitidos(form)]);
      setRespuestas(r);
      setEmitidos(e);
      setCuota(r.cuota);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [api, form]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const armado = respuestas ? armarPersonas(cert, respuestas.preguntas, respuestas.respuestas) : null;
  const personas = (armado?.lista ?? []).map((p) => conAjuste(p, ajustes[p.clave], cert));
  const emitidoDe = new Map(emitidos.map((e) => [e.clave, e]));
  const conEstado = personas.map((p) => ({ p, e: emitidoDe.get(p.clave), estado: estadoDe(p, emitidoDe.get(p.clave)) }));
  const cuenta = (f: (x: (typeof conEstado)[number]) => boolean) => conEstado.filter(f).length;
  const porEnviar = conEstado.filter((x) => x.estado === 'pendiente' || x.estado === 'emitido');
  const n = normalize(q);
  const lista = conEstado.filter(
    (x) =>
      (filtro === 'todos' ||
        (filtro === 'pendientes' && (x.estado === 'pendiente' || x.estado === 'emitido' || x.estado === 'sin-mail')) ||
        (filtro === 'enviados' && x.estado === 'enviado') ||
        (filtro === 'no-aprobados' && x.estado === 'no-aprobado')) &&
      (!n || normalize(`${x.p.nombre} ${x.p.dni} ${x.p.email}`).includes(n)),
  );

  const marcar = (clave: string, on: boolean) =>
    setEnCurso((prev) => {
      const next = new Set(prev);
      if (on) next.add(clave);
      else next.delete(clave);
      return next;
    });

  /** Genera el PDF con el código de siempre (o uno nuevo), lo registra y, si `mail`, lo manda. */
  const emitir = async (p: Persona, mail: boolean) => {
    const previo = emitidoDe.get(p.clave);
    const codigo = previo?.codigo ?? nuevoCodigo();
    const nota = cert.tipo === 'aprobacion' ? p.nota : null;
    const bytes = await generarCertificado(cert, { nombre: p.nombre, dni: p.dni, nota, codigo }, firma);
    const r = await api.certEmitir({
      formulario: form,
      clave: p.clave,
      codigo,
      nombre: p.nombre,
      dni: p.dni,
      email: p.email,
      nota,
      actividad: actividadDe(cert),
      fecha: cert.fecha,
      ...(mail
        ? {
            mail: {
              asunto: completar(cert.asunto?.trim() || ASUNTO, cert, p.nombre, codigo),
              texto: completar(cert.mensaje?.trim() || MENSAJE, cert, p.nombre, codigo),
              pdf: aBase64(bytes),
              archivo: nombreArchivo(p.nombre),
            },
          }
        : {}),
    });
    setCuota(r.cuota);
    const nuevo: Emitido = { clave: p.clave, codigo, nombre: p.nombre, email: p.email, nota, enviado: mail ? new Date().toISOString() : (previo?.enviado ?? null) };
    setEmitidos((prev) => [...prev.filter((e) => e.clave !== p.clave), nuevo]);
    setFallas(({ [p.clave]: _, ...resto }) => resto);
    return bytes;
  };

  const conAviso = async (p: Persona, fn: () => Promise<void>) => {
    marcar(p.clave, true);
    try {
      await fn();
    } catch (e) {
      const msg = (e as Error).message;
      setFallas((prev) => ({ ...prev, [p.clave]: msg }));
      toast.show({ text: `No se pudo con ${p.nombre}: ${msg}`, icon: MailWarning });
    } finally {
      marcar(p.clave, false);
    }
  };

  const enviarUno = async (p: Persona, yaEnviado: boolean) => {
    if (yaEnviado && !(await confirm({ title: `¿Reenviar el certificado a ${p.nombre}?`, body: `Le llega otra vez a ${p.email}, con el mismo código.`, confirmLabel: 'Reenviar', icon: Send, tono: 'accion' })))
      return;
    await conAviso(p, async () => {
      await emitir(p, true);
      toast.show({ text: `Certificado enviado a ${p.nombre}.`, icon: CheckCircle2 });
    });
  };

  const descargar = (p: Persona) =>
    conAviso(p, async () => {
      const bytes = await emitir(p, false);
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: nombreArchivo(p.nombre) });
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    });

  const enviarTodos = async () => {
    const total = porEnviar.length;
    const limite = cuota ?? total;
    const ok = await confirm({
      title: `¿Enviar ${total} certificado${total === 1 ? '' : 's'}?`,
      body:
        limite < total
          ? `Hoy Gmail deja mandar ${limite} más: el resto queda pendiente para mañana.`
          : 'Cada persona lo recibe en el mail que puso en el formulario.',
      confirmLabel: 'Enviar',
      icon: Send,
      tono: 'accion',
    });
    if (!ok) return;
    detener.current = false;
    let hechos = 0;
    let errores = 0;
    let restante = limite;
    setLote({ hechos: 0, total: Math.min(total, limite) });
    for (const { p } of porEnviar) {
      if (detener.current || restante <= 0) break;
      marcar(p.clave, true);
      try {
        await emitir(p, true);
        hechos++;
        restante--;
      } catch (e) {
        const msg = (e as Error).message;
        setFallas((prev) => ({ ...prev, [p.clave]: msg }));
        errores++;
        if (/límite|cuota/i.test(msg)) restante = 0;
      } finally {
        marcar(p.clave, false);
      }
      setLote((l) => (l ? { ...l, hechos: hechos + errores } : l));
    }
    setLote(null);
    const quedan = total - hechos;
    toast.show({
      text: `Se enviaron ${hechos} certificado${hechos === 1 ? '' : 's'}.${errores ? ` ${errores} con error (marcados en la lista).` : ''}${quedan - errores > 0 ? ` Quedan ${quedan - errores} pendientes.` : ''}`,
      icon: errores ? MailWarning : CheckCircle2,
    });
  };

  const guardarAjuste = (clave: string, a: Ajuste | null) => {
    const next = { ...ajustes };
    if (a && Object.keys(a).length) next[clave] = a;
    else delete next[clave];
    setAjustes(next);
    guardarAjustes(slug, next);
  };

  const ocupado = lote !== null;
  const sinPreguntas = armado && (!armado.preguntas.nombre || !armado.preguntas.dni);

  return (
    <div className={s.envios}>
      <section className={adm.panel} aria-labelledby="cert-resumen">
        <div className={s.cabecera}>
          <div>
            <h2 id="cert-resumen">{respuestas?.titulo ?? 'Formulario'}</h2>
            <p className={adm.help}>
              {respuestas
                ? `${personas.length} persona${personas.length === 1 ? '' : 's'} · ${cuenta((x) => x.estado === 'enviado')} enviados · ${porEnviar.length} por enviar`
                : cargando
                  ? 'Leyendo las respuestas…'
                  : ' '}
              {cuota !== null && <> · Gmail: quedan {cuota} envíos hoy</>}
            </p>
          </div>
          <div className={adm.headActions}>
            <Button variant="ghost" icon={RotateCw} spin={cargando} onClick={() => void cargar()} disabled={cargando || ocupado}>
              Actualizar
            </Button>
            {lote ? (
              <Button variant="secondary" icon={Square} onClick={() => (detener.current = true)}>
                Detener
              </Button>
            ) : (
              <Button variant="primary" icon={Send} onClick={() => void enviarTodos()} disabled={!porEnviar.length || cuota === 0}>
                {porEnviar.length ? `Enviar a ${porEnviar.length} pendiente${porEnviar.length === 1 ? '' : 's'}` : 'Nada por enviar'}
              </Button>
            )}
          </div>
        </div>

        {lote && (
          <div className={s.progreso} role="status">
            <span>
              Enviando {Math.min(lote.hechos + 1, lote.total)} de {lote.total}…
            </span>
            <div className={s.barra}>
              <i style={{ width: `${(lote.hechos / lote.total) * 100}%` }} />
            </div>
          </div>
        )}
        {firma === null && <p className={s.aviso}>Todavía no hay firma escaneada: los certificados salen solo con el nombre del rector. Se carga en «Datos del certificado».</p>}
        {cuota === 0 && <p className={s.aviso}>Gmail ya no deja mandar más mails hoy (límite de la cuenta). Los pendientes se pueden enviar mañana.</p>}
        {sinPreguntas && (
          <p className={s.aviso}>
            No encontré la pregunta del {!armado.preguntas.nombre ? 'nombre' : 'DNI'} en el formulario. Escribila tal cual en «Datos del certificado → Formulario y mail».
          </p>
        )}
        {error && (
          <div className={adm.errorBox} role="alert">
            <p>{error}</p>
            <Button variant="ghost" icon={RotateCw} onClick={() => void cargar()}>
              Volver a intentar
            </Button>
          </div>
        )}
      </section>

      {respuestas && (
        <>
          <div className={s.herramientas}>
            <label className={adm.search}>
              <Search size={16} aria-hidden />
              <input type="search" placeholder="Buscar por nombre, DNI o mail…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar personas" />
            </label>
            <div className={s.filtros} role="group" aria-label="Filtrar">
              {(
                [
                  ['todos', `Todos (${personas.length})`],
                  ['pendientes', `Por enviar (${cuenta((x) => x.estado === 'pendiente' || x.estado === 'emitido' || x.estado === 'sin-mail')})`],
                  ['enviados', `Enviados (${cuenta((x) => x.estado === 'enviado')})`],
                  ...(cert.tipo === 'aprobacion' && cert.notaMinima != null ? [['no-aprobados', `No aprobaron (${cuenta((x) => x.estado === 'no-aprobado')})`]] : []),
                ] as [Filtro, string][]
              ).map(([k, t]) => (
                <button key={k} type="button" aria-pressed={filtro === k} onClick={() => setFiltro(k)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {lista.length ? (
            <div className={s.tablaCaja}>
              <table className={s.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Persona</th>
                    <th scope="col">DNI</th>
                    {cert.tipo === 'aprobacion' && <th scope="col">Nota</th>}
                    <th scope="col">Estado</th>
                    <th scope="col">
                      <span className={s.oculto}>Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(({ p, e, estado }) => {
                    const trabajando = enCurso.has(p.clave);
                    const falla = fallas[p.clave];
                    return (
                      <tr key={p.clave} data-trabajando={trabajando || undefined}>
                        <td>
                          <strong>{p.nombre || '(sin nombre)'}</strong>
                          <small>
                            {p.email || 'sin mail'}
                            {p.intentos > 1 && ` · ${p.intentos} intentos (se toma el mejor)`}
                            {ajustes[p.clave] && ' · corregido a mano'}
                          </small>
                          {falla && <small className={s.falla}>{falla}</small>}
                        </td>
                        <td className={s.num}>{p.dni || '—'}</td>
                        {cert.tipo === 'aprobacion' && <td className={s.num}>{p.nota == null ? '—' : notaTexto(p.nota)}</td>}
                        <td>
                          <span className={`${s.estado} ${ESTADO[estado].cls}`}>{trabajando ? 'Enviando…' : ESTADO[estado].texto}</span>
                          {e?.enviado && <small>{fechaHora(e.enviado)}</small>}
                        </td>
                        <td className={s.acciones}>
                          <div>
                          <IconButton icon={Eye} label={`Ver el certificado de ${p.nombre}`} tip="Vista previa" onClick={() => setVista(p)} />
                          <IconButton icon={Pencil} label={`Corregir los datos de ${p.nombre}`} tip="Corregir datos" onClick={() => setEditando(p)} disabled={trabajando || ocupado} />
                          <IconButton icon={Download} label={`Descargar el certificado de ${p.nombre}`} tip="Descargar PDF" onClick={() => void descargar(p)} disabled={trabajando || ocupado || !p.aprobado} />
                          <IconButton
                            icon={estado === 'enviado' ? RotateCcw : Mail}
                            label={`${estado === 'enviado' ? 'Reenviar' : 'Enviar'} el certificado a ${p.nombre}`}
                            tip={estado === 'enviado' ? 'Reenviar por mail' : 'Enviar por mail'}
                            onClick={() => void enviarUno(p, estado === 'enviado')}
                            disabled={trabajando || ocupado || estado === 'no-aprobado' || estado === 'sin-mail' || cuota === 0}
                          />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={s.vacio}>{personas.length ? 'No hay personas con ese filtro.' : 'Todavía nadie completó el formulario.'}</p>
          )}
        </>
      )}

      <Modal
        open={vista !== null}
        onClose={() => setVista(null)}
        title={vista ? `Certificado de ${vista.nombre}` : 'Certificado'}
        icon={Eye}
        wide
        actions={
          vista && (
            <>
              <Button variant="secondary" icon={Download} onClick={() => void descargar(vista)} disabled={!vista.aprobado || enCurso.has(vista.clave)}>
                Descargar PDF
              </Button>
              <Button
                variant="primary"
                icon={Send}
                onClick={() => {
                  const p = vista;
                  setVista(null);
                  void enviarUno(p, emitidoDe.get(p.clave)?.enviado != null);
                }}
                disabled={estadoDe(vista, emitidoDe.get(vista.clave)) === 'no-aprobado' || estadoDe(vista, emitidoDe.get(vista.clave)) === 'sin-mail' || cuota === 0}
              >
                {emitidoDe.get(vista.clave)?.enviado ? 'Reenviar por mail' : 'Enviar por mail'}
              </Button>
            </>
          )
        }
      >
        {vista && (
          <Vista
            cert={cert}
            datos={{ nombre: vista.nombre, dni: vista.dni, nota: cert.tipo === 'aprobacion' ? vista.nota : null, codigo: emitidoDe.get(vista.clave)?.codigo ?? 'ISEF-XXXX-XXXX' }}
            firma={firma}
            firmaVersion={firmaVersion}
            etiqueta={`Vista previa del certificado de ${vista.nombre}`}
          />
        )}
      </Modal>

      {editando && (
        <EditarPersona
          persona={editando}
          original={armado?.lista.find((x) => x.clave === editando.clave) ?? editando}
          conNota={cert.tipo === 'aprobacion'}
          onClose={() => setEditando(null)}
          onSave={(a) => {
            guardarAjuste(editando.clave, a);
            setEditando(null);
          }}
        />
      )}
    </div>
  );
}

/** Corregir nombre, DNI, mail o nota antes de enviar (p. ej. tildes o mayúsculas). Queda guardado en este navegador. */
function EditarPersona({ persona, original, conNota, onClose, onSave }: { persona: Persona; original: Persona; conNota: boolean; onClose: () => void; onSave: (a: Ajuste | null) => void }) {
  const [v, setV] = useState({ nombre: persona.nombre, dni: persona.dni, email: persona.email, nota: persona.nota == null ? '' : String(persona.nota) });
  const guardar = () => {
    const a: Ajuste = {};
    if (v.nombre.trim() !== original.nombre) a.nombre = v.nombre.trim();
    if (v.dni.trim() !== original.dni) a.dni = v.dni.trim();
    if (v.email.trim() !== original.email) a.email = v.email.trim();
    const nota = v.nota.trim() === '' ? null : Math.max(0, Math.min(100, Number(v.nota)));
    if (conNota && nota !== original.nota && !Number.isNaN(nota)) a.nota = nota;
    onSave(a);
  };
  const campo = (k: keyof typeof v, label: string, extra: Partial<InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <label className={adm.field}>
      <span className={adm.label}>{label}</span>
      <input className={adm.input} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...extra} />
    </label>
  );
  return (
    <Modal
      open
      onClose={onClose}
      title="Corregir datos"
      icon={Pencil}
      actions={
        <>
          <Button variant="ghost" icon={RotateCcw} onClick={() => onSave(null)}>
            Volver a lo del formulario
          </Button>
          <Button variant="primary" icon={CheckCircle2} onClick={guardar}>
            Listo
          </Button>
        </>
      }
    >
      <form
        className={s.editar}
        onSubmit={(e) => {
          e.preventDefault();
          guardar();
        }}
      >
        {campo('nombre', 'Nombre como sale en el certificado')}
        {campo('dni', 'DNI', { inputMode: 'numeric' })}
        {campo('email', 'Mail', { type: 'email' })}
        {conNota && campo('nota', 'Nota (%)', { type: 'number', min: 0, max: 100 })}
        <p className={adm.help}>Los cambios se guardan en este navegador y se usan al generar y enviar. El formulario no se modifica.</p>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
