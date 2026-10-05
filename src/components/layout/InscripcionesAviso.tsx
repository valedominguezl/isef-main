import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { inscripcionesVigentes, sitio } from '@/content';
import { formatDate } from '@/lib/format';
import styles from './InscripcionesAviso.module.scss';

const DAY = 864e5;

/**
 * Franja fija arriba del navbar mientras las inscripciones están abiertas y tienen fecha de cierre.
 * La cuenta regresiva se calcula en el navegador (el HTML prerenderizado muestra solo la fecha).
 */
export default function InscripcionesAviso() {
  const { cierre } = sitio.inscripciones;
  const [dias, setDias] = useState<number | null>(null);

  useEffect(() => {
    if (!cierre) return;
    const fin = new Date(`${cierre}T23:59:59-03:00`).getTime();
    setDias(Math.ceil((fin - Date.now()) / DAY));
  }, [cierre]);

  if (!cierre || !inscripcionesVigentes() || (dias !== null && dias < 1)) return null;

  const urgente = dias !== null && dias <= 15;
  return (
    <div className={styles.aviso} data-announce>
      <Link to="/inscripciones" className={styles.link}>
        <span aria-hidden>🚀</span>
        <span>
          {urgente ? (
            <>
              <strong>{dias === 1 ? '¡Último día' : `¡Quedan ${dias} días`}</strong> para inscribirte!
            </>
          ) : (
            <>
              Inscripciones abiertas <span className={styles.hideSm}>hasta el </span>
              <strong>
                <span className={styles.showSm}>· cierran el </span>
                {formatDate(cierre, { year: false })}
              </strong>
            </>
          )}
        </span>
        <ArrowRight className={styles.arrow} size={16} aria-hidden />
      </Link>
    </div>
  );
}
