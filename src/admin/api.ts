/**
 * Cliente de las funciones del panel en el Worker (/api/*): búsqueda y descarga de fotos de stock gratis.
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

export interface AdminApi {
  buscarFotos: (q: string, signal?: AbortSignal) => Promise<FotoStock[]>;
  descargarFoto: (url: string, signal?: AbortSignal) => Promise<Blob>;
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
        headers: { authorization: `Bearer ${token}` },
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
  return {
    buscarFotos: async (q, signal) => ((await (await call(`/api/fotos?q=${encodeURIComponent(q)}`, { signal })).json()) as { fotos: FotoStock[] }).fotos ?? [],
    descargarFoto: async (url, signal) => (await call(`/api/fotos/descargar?url=${encodeURIComponent(url)}`, { signal })).blob(),
  };
}
