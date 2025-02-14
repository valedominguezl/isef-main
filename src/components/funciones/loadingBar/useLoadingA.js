import { useCallback } from 'react';
import { useLoading } from '@/components/funciones/context/LoadingContext';

const useLoadingA = () => {
  const { startLoading, stopLoading } = useLoading();

  return useCallback((e) => {
    // Prevenir la acción por defecto
    e.preventDefault();

    // Leer atributos del enlace
    const href = e.currentTarget.getAttribute('href');
    const target = e.currentTarget.getAttribute('target');

    // Iniciar la barra de carga
    startLoading();

    const delay = Math.floor(Math.random() * (500 - 300 + 1)) + 300;

    setTimeout(() => {
      // Finalizar la barra de carga
      stopLoading();

      // Ejecutar la acción: si target es "_blank" abrir en nueva pestaña, sino navegar
      if (target === '_blank') {
        window.open(href, '_blank');
      } else {
        window.location.href = href;
      }
    }, delay);
  }, [startLoading, stopLoading]);
};

export default useLoadingA;
