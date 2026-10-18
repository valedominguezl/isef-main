import { useEffect, type RefObject } from 'react';

/**
 * Para capas a pantalla completa que no son un <dialog> nativo (menú móvil, buscador):
 * mientras están abiertas, todo lo demás de la página queda `inert` (Tab no se escapa detrás
 * y el lector de pantalla no lo lee), y al cerrar el foco vuelve a donde estaba
 * (salvo `restoreFocus: false`, si el componente ya lo resuelve por su cuenta).
 */
export function useModalFocus(open: boolean, ref: RefObject<HTMLElement | null>, { restoreFocus = true } = {}) {
  useEffect(() => {
    if (!open) return;
    const previo = document.activeElement as HTMLElement | null;
    const inertes: HTMLElement[] = [];
    let capa: HTMLElement | null = null;
    // El nodo puede montarse un cuadro después (AnimatePresence): se busca al próximo frame
    const frame = requestAnimationFrame(() => {
      capa = ref.current;
      let el = capa;
      while (el && el !== document.body) {
        const padre: HTMLElement | null = el.parentElement;
        for (const hermano of Array.from(padre?.children ?? [])) {
          if (hermano !== el && hermano instanceof HTMLElement && !hermano.inert && hermano.tagName !== 'SCRIPT') {
            hermano.inert = true;
            inertes.push(hermano);
          }
        }
        el = padre;
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      for (const el of inertes) el.inert = false;
      if (!restoreFocus) return;
      // Si el foco quedó en el body o adentro de la capa (que sale animada), vuelve al botón que la abrió
      requestAnimationFrame(() => {
        const activo = document.activeElement;
        if (previo?.isConnected && (!activo || activo === document.body || capa?.contains(activo))) previo.focus();
      });
    };
  }, [open, ref, restoreFocus]);
}
