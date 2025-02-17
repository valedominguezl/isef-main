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

    const animatedElements = container.querySelectorAll(`.${styles.dato}`);

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
            }, index * 500);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach(el => observer.observe(el));

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={containerRef} className={`${styles.container} bl`}>
      <div className={styles.datos}>

        {/* DATO 1 */}
        <div className={styles.dato}>
          <div
            className={styles.background}
            style={{ backgroundImage: `url(${añosImg})` }}
          ></div>
          <div className={styles.txt}>
            <h2>
              <span>+{startCountUp[0] && <CountUp start={0} end={30} duration={3} />}</span>
            </h2>
            <p>años formando</p>
          </div>
          <div className={styles.imgCont}>
            <img src={añosImg} alt="Años" />
          </div>
        </div>

        {/* DATO 2 */}
        <div className={styles.dato}>
          <div
            className={styles.background}
            style={{ backgroundImage: `url(${institucionesImg})` }}
          ></div>
          <div className={styles.txt}>
            <h2>
              <span>{startCountUp[1] && <CountUp start={1} end={2} duration={10} />}</span>
            </h2>
            <p>instituciones</p>
          </div>
          <div className={styles.imgCont}>
            <img src={institucionesImg} alt="Instituciones" />
          </div>
        </div>

        {/* DATO 3 */}
        <div className={styles.dato}>
          <div
            className={styles.background}
            style={{ backgroundImage: `url(${egresadosImg})` }}
          ></div>
          <div className={styles.txt}>
            <h2>
              <span>+{startCountUp[2] && <CountUp start={0} end={5000} duration={3} />}</span>
            </h2>
            <p>egresados</p>
          </div>
          <div className={styles.imgCont}>
            <img src={egresadosImg} alt="Egresados" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Datos;
