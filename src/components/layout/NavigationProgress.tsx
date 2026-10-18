import { useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router';
import styles from './NavigationProgress.module.scss';

type Fase = 'idle' | 'active' | 'done';

/**
 * Barra superior mientras se descarga el código de la próxima página (real, no simulada).
 * Al terminar se completa hasta el final y recién ahí se desvanece (antes volvía hacia atrás y parecía «cancelado»).
 */
export default function NavigationProgress() {
  const cargando = useNavigation().state !== 'idle';
  const [fase, setFase] = useState<Fase>('idle');
  const prev = useRef(false);

  useEffect(() => {
    if (cargando) setFase('active');
    else if (prev.current) {
      setFase('done');
      const t = setTimeout(() => setFase('idle'), 600);
      prev.current = cargando;
      return () => clearTimeout(t);
    }
    prev.current = cargando;
  }, [cargando]);

  return <div className={[styles.bar, fase !== 'idle' && styles[fase]].filter(Boolean).join(' ')} aria-hidden />;
}
