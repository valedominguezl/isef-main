import { useEffect, useState } from 'react';
import Seo from '@/components/seo/Seo';
import StroopTest from '@/features/test-hiit/StroopTest';

/** Protocolo de investigación (Stroop). Solo cliente: usa localStorage y mide tiempos de reacción. */
export function Component() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <Seo title="Test HIIT" description="Prueba de interferencia Stroop del proyecto de investigación HIIT del I.S.E.F. San Luis." noindex />
      <div style={{ paddingTop: 'var(--header-h)', minHeight: '100svh' }}>{mounted && <StroopTest />}</div>
    </>
  );
}
