import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router';
import { LogOut } from 'lucide-react';
import { useConfirm } from './ui/ConfirmDialog';

/**
 * Cambios sin guardar: avisa al cerrar la pestaña (beforeunload) y también al irse a otra pantalla del
 * panel (antes un clic en la barra lateral descartaba el borrador en silencio).
 * Cambiar de pestaña dentro del mismo editor (?tab=) no cuenta. `limpiar()` se llama justo antes de
 * navegar después de guardar o eliminar (el estado `dirty` recién se actualiza en el próximo render).
 */
export function useUnsavedGuard(dirty: boolean) {
  const confirm = useConfirm();
  const sucio = useRef(dirty);
  useEffect(() => {
    sucio.current = dirty;
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => sucio.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    let vivo = true;
    void confirm({
      title: '¿Salir sin guardar?',
      body: 'Los cambios de este formulario se pierden.',
      confirmLabel: 'Salir sin guardar',
      icon: LogOut,
    }).then((ok) => {
      if (!vivo) return;
      if (ok) blocker.proceed();
      else blocker.reset();
    });
    return () => {
      vivo = false;
    };
  }, [blocker.state]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    limpiar: () => {
      sucio.current = false;
    },
  };
}

/** Después de marcar errores: el foco va al primer campo con problema (las secciones se abren solas antes). */
export function enfocarPrimerError() {
  window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 60);
}
