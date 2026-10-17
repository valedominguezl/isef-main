/**
 * De las respuestas del Google Form a la lista de personas del panel:
 * una por DNI (o mail), con su mejor intento, el nombre prolijo y si aprobó.
 */
import type { Certificado } from '@/content/schema';
import type { Agregado, Emitido, RespuestaForm } from '../api';

export interface Persona {
  /** DNI solo con números (o el mail si no hay DNI): identifica a la persona en el registro. */
  clave: string;
  nombre: string;
  dni: string;
  email: string;
  nota: number | null;
  intentos: number;
  fecha: string;
  aprobado: boolean;
  /** Agregada a mano desde el panel (no completó el formulario). */
  manual?: boolean;
}

/** Lo que se corrige a mano antes de enviar (queda guardado en este navegador). */
export type Ajuste = Partial<Pick<Persona, 'nombre' | 'dni' | 'email' | 'nota'>>;

const RE_NOMBRE = /nombre|apellido/i;
const RE_DNI = /\bd\.?\s?n\.?\s?i\b|documento/i;
const RE_MAIL = /correo|e-?mail/i;

/** Pregunta del formulario para cada dato: la configurada o la primera que se parezca. */
export function detectarPreguntas(cert: Pick<Certificado, 'preguntaNombre' | 'preguntaDni'>, preguntas: string[]) {
  const buscar = (fija: string | undefined, re: RegExp) => (fija?.trim() && preguntas.includes(fija.trim()) ? fija.trim() : preguntas.find((p) => re.test(p)));
  return { nombre: buscar(cert.preguntaNombre, RE_NOMBRE), dni: buscar(cert.preguntaDni, RE_DNI), mail: preguntas.find((p) => RE_MAIL.test(p)) };
}

const MINUSCULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'di', 'van', 'von']);

/** «ADRIAN DAVID dominguez» → «Adrian David Dominguez». Si ya viene con mayúsculas mezcladas, se respeta. */
export function nombreProlijo(s: string) {
  const t = s.replace(/\s+/g, ' ').trim();
  const mezclado = t !== t.toLowerCase() && t !== t.toUpperCase() && t.split(' ').every((p) => p[0] === p[0].toUpperCase());
  if (mezclado) return t;
  return t
    .toLowerCase()
    .split(' ')
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.replace(/(^|[-'])\p{L}/gu, (c) => c.toUpperCase())))
    .join(' ');
}

const soloNumeros = (s: string) => s.replace(/\D/g, '');

/** Clave de una persona: el DNI solo con números o, si no hay, el mail. */
export const claveDe = (dni: string, email: string) => dni.replace(/\D/g, '') || email.trim().toLowerCase();

const aprueba = (cert: Certificado, nota: number | null) => cert.tipo !== 'aprobacion' || cert.notaMinima == null || (nota ?? 0) >= cert.notaMinima;

export function armarPersonas(cert: Certificado, preguntas: string[], respuestas: RespuestaForm[], agregados: Agregado[] = []) {
  const q = detectarPreguntas(cert, preguntas);
  const porClave = new Map<string, { mejor: RespuestaForm; nota: number | null; intentos: number }>();
  for (const r of respuestas) {
    const dni = soloNumeros((q.dni && r.campos[q.dni]) || '');
    const email = (r.email || (q.mail && r.campos[q.mail]) || '').trim().toLowerCase();
    const clave = dni || email;
    if (!clave) continue;
    const nota = r.puntaje != null && r.maximo ? (r.puntaje / r.maximo) * 100 : null;
    const prev = porClave.get(clave);
    // Mejor intento; si empatan, el más nuevo
    const mejor = !prev || (nota ?? -1) > (prev.nota ?? -1) || ((nota ?? -1) === (prev.nota ?? -1) && r.fecha > prev.mejor.fecha);
    porClave.set(clave, { mejor: mejor ? r : prev!.mejor, nota: mejor ? nota : prev!.nota, intentos: (prev?.intentos ?? 0) + 1 });
  }
  const lista: Persona[] = [...porClave].map(([clave, { mejor: r, nota, intentos }]) => ({
    clave,
    nombre: nombreProlijo((q.nombre && r.campos[q.nombre]) || ''),
    dni: (q.dni && r.campos[q.dni]?.trim()) || '',
    email: (r.email || (q.mail && r.campos[q.mail]) || '').trim(),
    nota: nota == null ? null : Math.round(nota),
    intentos,
    fecha: r.fecha,
    aprobado: aprueba(cert, nota),
  }));
  // Agregados a mano (si la persona también está en el formulario, manda el formulario)
  for (const a of agregados)
    if (!porClave.has(a.clave))
      lista.push({ clave: a.clave, nombre: a.nombre, dni: a.dni, email: a.email, nota: a.nota, intentos: 0, fecha: a.fecha ?? '', aprobado: aprueba(cert, a.nota), manual: true });
  lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  return { lista, preguntas: q };
}

/** Persona + lo corregido a mano. */
export function conAjuste(p: Persona, a: Ajuste | undefined, cert: Certificado): Persona {
  if (!a) return p;
  const nota = a.nota !== undefined ? a.nota : p.nota;
  return { ...p, ...a, nota, aprobado: cert.tipo !== 'aprobacion' || cert.notaMinima == null || (nota ?? 0) >= cert.notaMinima };
}

export type Estado = 'enviado' | 'emitido' | 'pendiente' | 'no-aprobado' | 'sin-mail';

export function estadoDe(p: Persona, e: Emitido | undefined): Estado {
  if (e?.enviado) return 'enviado';
  if (!p.aprobado) return 'no-aprobado';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return 'sin-mail';
  return e ? 'emitido' : 'pendiente';
}

/* ── Ajustes guardados en el navegador (por actividad) ── */
const KEY = (slug: string) => `isef-cert-ajustes:${slug}`;

export function leerAjustes(slug: string): Record<string, Ajuste> {
  try {
    return JSON.parse(localStorage.getItem(KEY(slug)) ?? '{}') as Record<string, Ajuste>;
  } catch {
    return {};
  }
}

export function guardarAjustes(slug: string, a: Record<string, Ajuste>) {
  try {
    localStorage.setItem(KEY(slug), JSON.stringify(a));
  } catch {
    /* sin almacenamiento: los ajustes duran hasta recargar */
  }
}

/** ID del Google Form a partir del link (o el ID pegado tal cual). */
export function idFormulario(link: string) {
  return link.match(/\/forms\/d\/([\w-]{20,})/)?.[1] ?? link.trim();
}
