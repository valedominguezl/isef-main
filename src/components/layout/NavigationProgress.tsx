import { useNavigation } from 'react-router';
import styles from './NavigationProgress.module.scss';

/** Barra superior mientras se descarga el código de la próxima página (real, no simulada). */
export default function NavigationProgress() {
  const nav = useNavigation();
  return <div className={[styles.bar, nav.state !== 'idle' && styles.active].filter(Boolean).join(' ')} aria-hidden />;
}
