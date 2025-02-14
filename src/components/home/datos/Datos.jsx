import React, { useEffect, useRef, useState } from 'react';
import styles from './Datos.module.scss';
import CountUp from 'react-countup';

import añosImg from '@/assets/simbols/años.webp';
import institucionesImg from '@/assets/simbols/instituciones.webp';
import egresadosImg from '@/assets/simbols/egresados.webp';

const Datos = () => {
  const containerRef = useRef(null);
  const [startCountUp, setStartCountUp] = useState([false, false, false]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Selecciona todos los elementos con la clase 'dato'
    const animatedElements = container.querySelectorAll(`.${styles.dato}`);

    // IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(animatedElements).indexOf(entry.target);
            setTimeout(() => {
              entry.target.classList.add(styles.visible);
              setStartCountUp((prev) => {
                const newStart = [...prev];
                newStart[index] = true;
                return newStart;
              });
            }, index * 500); // Cambia el valor 500 por el delay deseado en milisegundos entre animaciones
            observer.unobserve(entry.target);
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

  const backgrounds = {
    años: 'url(src/assets/simbols/años.webp)',
    instituciones: 'url(src/assets/simbols/instituciones.webp)',
    egresados: 'url(src/assets/simbols/egresados.webp)',
  };

  return (
    <div ref={containerRef} className={`${styles.container} bl`}>
      <div className={styles.datos}>
        <div className={styles.dato} style={{ '--background-datos-url': backgrounds.años }}>
          <div className={styles.txt}>
            <h2>
              <span>+
                {startCountUp[0] && <CountUp start={0} end={30} duration={3} />}
              </span>
            </h2>
            <p>años formando</p>
          </div>
          <div className={styles.imgCont}>
            <img src={añosImg} alt="" />
          </div>
        </div>

        <div className={styles.dato} style={{ '--background-datos-url': backgrounds.instituciones }}>
          <div className={styles.txt}>
            <h2><span>2</span></h2>
            <p>instituciones</p>
          </div>
          <div className={styles.imgCont}>
            <img src={institucionesImg} alt="" />
          </div>
        </div>

        <div className={styles.dato} style={{ '--background-datos-url': backgrounds.egresados }}>
          <div className={styles.txt}>
            <h2>
              <span>+
                {startCountUp[2] && <CountUp start={0} end={5000} duration={3} />}
              </span>
            </h2>
            <p>egresados</p>
          </div>
          <div className={styles.imgCont}>
            <img src={egresadosImg} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datos;
