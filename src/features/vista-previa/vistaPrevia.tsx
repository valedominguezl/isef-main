/**
 * Vista previa del panel (/admin → Páginas): el panel abre la página real en un iframe con
 * `?vista-previa=<bloque>` (a ancho de computadora y de celular) y le manda por postMessage el
 * borrador de ese bloque. La página dibuja solo ese bloque, con los textos del borrador, y le avisa
 * al panel su alto para que ajuste el marco. Fuera del iframe no cambia nada.
 */
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { paginas } from '@/content';
import { resolverPagina, type PaginaResuelta } from '@/content/paginas';
import type { PaginaKey } from '@/content/schema';

export type MensajeVista =
  | { tipo: 'isef-vista-lista' }
  | { tipo: 'isef-vista-alto'; alto: number }
  | { tipo: 'isef-vista-datos'; pagina: PaginaKey; datos: unknown };

/** Bloque que se está previsualizando; null en el sitio normal (y en el prerender). */
export const BLOQUE_VISTA: string | null =
  typeof window !== 'undefined' && window.parent !== window ? new URLSearchParams(window.location.search).get('vista-previa') : null;

let borrador: { pagina: PaginaKey; datos: unknown } | null = null;
const avisos = new Set<() => void>();
const suscribir = (fn: () => void) => {
  avisos.add(fn);
  return () => {
    avisos.delete(fn);
  };
};

/** Textos y fotos de una página: los publicados o, en la vista previa, los del borrador del panel. */
export function usePagina<K extends PaginaKey>(key: K): PaginaResuelta<K> {
  const b = useSyncExternalStore(
    suscribir,
    () => borrador,
    () => null,
  );
  return useMemo(() => (b?.pagina === key ? resolverPagina(key, b.datos) : paginas[key]), [b, key]);
}

/**
 * Envuelve un bloque editable de una página. En la vista previa solo se dibuja el que se está
 * editando (el resto de la página, editable o no, se oculta); en el sitio no agrega nada.
 */
export function Bloque({ id, children }: { id: string; children: ReactNode }) {
  if (BLOQUE_VISTA == null) return children;
  if (BLOQUE_VISTA !== id) return null;
  return (
    <div data-vista-bloque style={{ display: 'contents' }}>
      {children}
    </div>
  );
}

/** Lado de la página (desde Layout): recibe el borrador y avisa el alto del bloque. */
export function useVistaPrevia() {
  useEffect(() => {
    const main = document.getElementById('contenido');
    if (BLOQUE_VISTA == null || !main) return;
    const enviar = (m: MensajeVista) => window.parent.postMessage(m, window.location.origin);
    // Sin barra de desplazamiento (el marco del panel toma el alto del bloque) y sin las secciones
    // que no son el bloque; las formas de fondo (aria-hidden) quedan
    document.documentElement.style.overflow = 'hidden';
    const estilo = document.createElement('style');
    estilo.textContent = '#contenido > :not([data-vista-bloque], [aria-hidden]) { display: none !important; }';
    document.head.append(estilo);

    const onMensaje = (e: MessageEvent<MensajeVista>) => {
      if (e.source !== window.parent || e.origin !== window.location.origin || e.data?.tipo !== 'isef-vista-datos') return;
      borrador = { pagina: e.data.pagina, datos: e.data.datos };
      avisos.forEach((fn) => fn());
    };

    let ultimo = -1;
    const medir = () => {
      // offsetTop/offsetHeight: el alto de diseño, sin las animaciones de entrada (transform); las formas de fondo no cuentan
      let alto = 0;
      for (const el of main.querySelectorAll(':scope > [data-vista-bloque] > *')) {
        if (!(el instanceof HTMLElement) || /absolute|fixed/.test(getComputedStyle(el).position)) continue;
        alto = Math.max(alto, el.offsetTop + el.offsetHeight);
      }
      if (alto) alto = Math.ceil(alto + main.offsetTop);
      if (alto === ultimo) return;
      ultimo = alto;
      enviar({ tipo: 'isef-vista-alto', alto });
    };
    const ro = new ResizeObserver(medir);
    const observar = () => {
      ro.disconnect();
      for (const el of main.querySelectorAll(':scope > [data-vista-bloque] > *')) ro.observe(el);
      medir();
    };
    const mo = new MutationObserver(observar);
    mo.observe(main, { childList: true, subtree: true });
    observar();

    window.addEventListener('message', onMensaje);
    enviar({ tipo: 'isef-vista-lista' });
    return () => {
      window.removeEventListener('message', onMensaje);
      mo.disconnect();
      ro.disconnect();
      estilo.remove();
    };
  }, []);
}
