/**
 * Cliente de las funciones del panel en el Worker (/api/*): fotos de stock gratis y certificados.
 * Solo existen en el sitio publicado; en `npm run dev` o sin contraseña fallan con un mensaje claro.
 * La contraseña la pone AdminContext (se crea con `createApi(getToken)`): la interfaz nunca la ve.
 */

export interface FotoStock {
  miniatura: string;
  url: string;
  autor: string;
  fuente: string;
  enlace: string;
}

/** Una respuesta del Google Form (la lee el Apps Script del instituto). */
export interface RespuestaForm {
  id: string;
  fecha: string;
  email: string;
  puntaje: number | null;
  maximo: number | null;
  /** Pregunta → respuesta. */
  campos: Record<string, string>;
}

export interface RespuestasForm {
  titulo: string;
  preguntas: string[];
  respuestas: RespuestaForm[];
  /** Mails que Gmail todavía deja mandar hoy. */
  cuota: number;
}

/** Certificado ya emitido (registro del Apps Script). */
export interface Emitido {
  clave: string;
  codigo: string;
  nombre: string;
  email: string;
  nota: number | null;
  /** Fecha y hora del último envío por mail (null = solo descargado). */
  enviado: string | null;
}

export interface Emision {
  formulario: string;
  clave: string;
  codigo: string;
  nombre: string;
  dni: string;
  email: string;
  nota: number | null;
  actividad: string;
  fecha: string;
  /** Con mail: se manda y queda registrado. Sin mail: solo se registra (descarga). */
  mail?: { asunto: string; texto: string; pdf: string; archivo: string };
}

export interface AdminApi {
  buscarFotos: (q: string, signal?: AbortSignal) => Promise<FotoStock[]>;
  descargarFoto: (url: string, signal?: AbortSignal) => Promise<Blob>;
  certRespuestas: (formulario: string) => Promise<RespuestasForm>;
  certEmitidos: (formulario: string) => Promise<Emitido[]>;
  certEmitir: (e: Emision) => Promise<{ cuota: number }>;
  /** Firma escaneada (PNG en base64) o null si todavía no se cargó. */
  certFirma: () => Promise<string | null>;
  certGuardarFirma: (png: string | null) => Promise<void>;
}

export const NO_DISPONIBLE = 'Disponible en el panel publicado (isefsanluis.net/admin)';

/** Error de un pedido cancelado por la persona (no se muestra). */
export const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

export function createApi(getToken: () => string | null): AdminApi {
  const call = async (path: string, init: RequestInit = {}): Promise<Response> => {
    const token = getToken();
    if (!token) throw new Error(NO_DISPONIBLE);
    let r: Response;
    try {
      r = await fetch(path, {
        ...init,
        headers: { authorization: `Bearer ${token}`, ...(init.body ? { 'content-type': 'application/json' } : {}) },
        cache: 'no-store',
      });
    } catch (e) {
      if (isAbort(e)) throw e;
      throw new Error('Sin conexión. Probá de nuevo.', { cause: e });
    }
    const tipo = r.headers.get('content-type') ?? '';
    if (r.ok && !tipo.includes('text/html')) return r;
    // Con `npm run dev` no hay Worker: Vite contesta con su página o un 404 sin JSON
    if (!tipo.includes('application/json')) throw new Error(NO_DISPONIBLE);
    const { error } = (await r.json().catch(() => ({}))) as { error?: string };
    throw new Error(error || 'No se pudo completar el pedido. Probá de nuevo.');
  };
  if (import.meta.env.DEV) return { ...api(call), ...certDemo };
  return api(call);
}

function api(call: (path: string, init?: RequestInit) => Promise<Response>): AdminApi {
  const form = (f: string) => `form=${encodeURIComponent(f)}`;
  return {
    certRespuestas: async (f) => (await call(`/api/certificados/respuestas?${form(f)}`)).json() as Promise<RespuestasForm>,
    certEmitidos: async (f) => ((await (await call(`/api/certificados/emitidos?${form(f)}`)).json()) as { emitidos: Emitido[] }).emitidos ?? [],
    certEmitir: async (e) => (await call('/api/certificados/emitir', { method: 'POST', body: JSON.stringify(e) })).json() as Promise<{ cuota: number }>,
    certFirma: async () => ((await (await call('/api/certificados/firma')).json()) as { png: string | null }).png ?? null,
    certGuardarFirma: async (png) => {
      await call('/api/certificados/firma', { method: 'POST', body: JSON.stringify({ png }) });
    },
    buscarFotos: async (q, signal) => ((await (await call(`/api/fotos?q=${encodeURIComponent(q)}`, { signal })).json()) as { fotos: FotoStock[] }).fotos ?? [],
    descargarFoto: async (url, signal) => (await call(`/api/fotos/descargar?url=${encodeURIComponent(url)}`, { signal })).blob(),
  };
}

/* ── `npm run dev`: no hay Worker ni Google; datos de ejemplo para probar la sección Certificados ── */
const demoEmitidos = new Map<string, Emitido>();
let demoCuota = 100;
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
const FIRMA_DEMO = 'isef-cert-firma-demo';
const certDemo: Pick<AdminApi, 'certRespuestas' | 'certEmitidos' | 'certEmitir' | 'certFirma' | 'certGuardarFirma'> = {
  async certFirma() {
    try {
      return localStorage.getItem(FIRMA_DEMO);
    } catch {
      return null;
    }
  },
  async certGuardarFirma(png) {
    try {
      if (png) localStorage.setItem(FIRMA_DEMO, png);
      else localStorage.removeItem(FIRMA_DEMO);
    } catch {
      /* sin almacenamiento en modo demo */
    }
  },
  async certRespuestas() {
    await espera(400);
    const r = (id: string, fecha: string, email: string, nombre: string, dni: string, puntaje: number): RespuestaForm => ({
      id,
      fecha,
      email,
      puntaje,
      maximo: 100,
      campos: { 'Correo electrónico': email, 'Nombre y Apellido completo': nombre, 'D.N.I.': dni },
    });
    return {
      titulo: 'Evaluación - Neuroeducación Módulo 1 (ejemplo)',
      preguntas: ['Correo electrónico', 'Nombre y Apellido completo', 'D.N.I.', 'Ingresa la clave de acceso'],
      respuestas: [
        r('1', '2026-10-13T00:58:57Z', 'maria.gomez@example.com', 'MARÍA LAURA GÓMEZ', '30.123.456', 40),
        r('2', '2026-10-13T01:07:33Z', 'maria.gomez@example.com', 'María Laura Gómez', '30123456', 95),
        r('3', '2026-10-13T02:17:00Z', 'jperez@example.com', 'juan pablo pérez de la fuente', '28987654', 80),
        r('4', '2026-10-13T12:26:16Z', 'lucia@example.com', 'Lucía Fernández', '41222333', 35),
        r('5', '2026-10-13T12:29:07Z', '', 'Sofía Martínez Castro', '39555111', 90),
      ],
      cuota: demoCuota,
    };
  },
  async certEmitidos() {
    await espera(200);
    return [...demoEmitidos.values()];
  },
  async certEmitir(e) {
    await espera(700);
    if (e.mail) {
      if (demoCuota <= 0) throw new Error('Gmail ya no deja mandar más mails hoy.');
      demoCuota--;
    }
    const prev = demoEmitidos.get(e.clave);
    demoEmitidos.set(e.clave, { clave: e.clave, codigo: e.codigo, nombre: e.nombre, email: e.email, nota: e.nota, enviado: e.mail ? new Date().toISOString() : (prev?.enviado ?? null) });
    return { cuota: demoCuota };
  },
};
