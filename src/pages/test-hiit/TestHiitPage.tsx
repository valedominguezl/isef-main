import { useEffect, useState, type CSSProperties } from 'react';
import Seo from '@/components/seo/Seo';
import StroopTest from '@/features/test-hiit/StroopTest';

/**
 * Variables que espera StroopTest.module.scss (heredadas del sitio original). Sin ellas el `padding`
 * del contenedor queda inválido (0) y la tarjeta queda pegada al navbar.
 */
const vars = { '--padding-100': 'var(--gutter)', '--padding-up': 'var(--section-y)', minHeight: '100svh' } as CSSProperties;

/** Protocolo de investigación (Stroop). Solo cliente: usa localStorage y mide tiempos de reacción. */
export function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <Seo title="Test HIIT" description="Prueba de interferencia Stroop del proyecto de investigación HIIT del I.S.E.F. San Luis." noindex />
      {/* El h1 va dentro del bloque: el navbar toma el primer hijo de <main> como cabecera */}
      <div style={vars}>
        <h1 className="sr-only">Test HIIT</h1>
        {mounted && <StroopTest />}
      </div>
    </>
  );
}
