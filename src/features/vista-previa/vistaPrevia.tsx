/**
 * Vista previa del panel (/admin → Páginas): el panel abre la página real en un iframe con
 * `?vista-previa=<bloque>` (a tamaño de pantalla de computadora y de celular) y le manda por
 * postMessage el borrador de ese bloque. La página entera se dibuja con los textos del borrador,
 * desplazada para que el bloque quede arriba de la pantalla, y le avisa al panel cuánto mide el
 * bloque (si no entra en una pantalla, el marco se estira). Fuera del iframe no cambia nada.
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
 * Envuelve un bloque editable de una página: en la vista previa marca el que se está editando
 * (la página lo lleva al borde de arriba); en el sitio no agrega nada.
 */
export function Bloque({ id, children }: { id: string; children: ReactNode }) {
  if (BLOQUE_VISTA !== id) return children;
  return (
    <div data-vista-bloque style={{ display: 'contents' }}>
      {children}
    </div>
  );
}

/** Lado de la página (desde Layout): recibe el borrador, lleva el bloque arriba y avisa su alto. */
export function useVistaPrevia() {
  useEffect(() => {
    const main = document.getElementById('contenido');
    if (BLOQUE_VISTA == null || !main) return;
    const enviar = (m: MensajeVista) => window.parent.postMessage(m, window.location.origin);
    // Sin barra de desplazamiento: la página se mueve sola hasta el bloque (es solo para mirar)
    document.documentElement.style.overflow = 'hidden';

    const onMensaje = (e: MessageEvent<MensajeVista>) => {
      if (e.source !== window.parent || e.origin !== window.location.origin || e.data?.tipo !== 'isef-vista-datos') return;
      borrador = { pagina: e.data.pagina, datos: e.data.datos };
      avisos.forEach((fn) => fn());
    };

    let ultimo = -1;
    // Posición de la página con el bloque arriba. Se sostiene porque, al cargar, el sitio vuelve
    // la página al principio (ScrollRestoration) después de que se la movió
    let objetivo = 0;
    const sostener = () => {
      if (Math.abs(window.scrollY - objetivo) > 1) window.scrollTo({ top: objetivo, behavior: 'instant' });
    };
    const medir = () => {
      // offsetTop/offsetHeight: el alto de diseño, sin las animaciones de entrada (transform); las formas de fondo no cuentan
      let desde = Infinity;
      let hasta = 0;
      for (const el of main.querySelectorAll(':scope > [data-vista-bloque] > *')) {
        if (!(el instanceof HTMLElement) || /absolute|fixed/.test(getComputedStyle(el).position)) continue;
        desde = Math.min(desde, el.offsetTop);
        hasta = Math.max(hasta, el.offsetTop + el.offsetHeight);
      }
      // El bloque, arriba de la pantalla (la barra del sitio se esconde sola al bajar, como en el sitio)
      let alto = 0;
      if (hasta) {
        const arriba = Math.round(desde + main.offsetTop);
        const tope = document.documentElement.scrollHeight - window.innerHeight;
        objetivo = Math.max(0, Math.min(arriba < 120 ? 0 : arriba, tope));
        sostener();
        alto = Math.ceil(hasta + main.offsetTop - objetivo);
      }
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
    window.addEventListener('scroll', sostener, { passive: true });
    enviar({ tipo: 'isef-vista-lista' });
    return () => {
      window.removeEventListener('message', onMensaje);
      window.removeEventListener('scroll', sostener);
      mo.disconnect();
      ro.disconnect();
    };
  }, []);
}
