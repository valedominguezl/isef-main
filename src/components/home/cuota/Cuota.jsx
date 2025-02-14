import React, { useEffect, useRef } from 'react';
import styles from './Cuota.module.scss'
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor'

const Cuota = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seleccion elementos a animar:
    const titulo = container.querySelector(`.${styles.titulo}`);
    const parrafos = container.querySelector(`.${styles.parrafos}`);

    // Array
    const animatedElements = [titulo, parrafos].filter(Boolean);

    // IntersectionObserver
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach(el => observer.observe(el));

    // Cleanup
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={containerRef} className={`${styles.container} bl`}>

      <div className={styles.txt}>

        <div className={styles.titulo}>
          <h3>I.S.E.F. San Luís | No hay competencia</h3>
          <h2>La cuota más <span>competitiva</span></h2>
        </div>

        <div className="linea-svg bl"></div>
        <p className={styles.parrafos}>
          En el I.S.E.F. San Luís <strong>no te cobramos gastos adicionales</strong>, sean constancias, certificaciones, cuotas aguinaldo, matricula o pileta de natación. Vos nos importás, por eso tenemos <strong>la cuota más baja de todo el país</strong>. 
          </p>

      </div>

      <LoadingAnchor className='btn-cta grad3' href='/Aranceles'>
        Aranceles
      </LoadingAnchor>

    </div>
  )
}

export default Cuota