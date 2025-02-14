import React, { useEffect, useRef } from 'react';
import styles from './Intro.module.scss'
import intro from '@/assets/media/home/especializaciones.webp';
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';


const Intro = () => {
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
    <div className={styles.color}>
      <div ref={containerRef} className={styles.container}>
        <div className={styles.txtCont}>

          <div className={styles.txt}>
            <div className={styles.titulo}>
              <h3>I.S.E.F. San Luís | Lo que nos hace distintos</h3>
              <h2>Las <span className='color1'>especializaciones</span></h2>
            </div>

            <div className="linea-svg"></div>

            <div className={styles.parrafos}>
              <p>
                En el I.S.E.F. San Luís te formamos en el campo de las <strong>neurociencias</strong>, la actividad física en las ECT (enfermedades crónicas no transmisibles), adulto mayor, menopausia, nutrición deportiva y muchas más áreas. Esto, gracias a nuestros <strong>científicos de renombre mundial</strong> que te darán harramientas para aplicar dentro del sistema educativo como prevención, pero también en clubes, gimnasios, centros de salud, etc. <br /> <br />

                Las enfermedades mentales, según las neurociencias, se vinculan con la salud física y atender enfermedades crónicas no transmisibles desde el ejercicio es fundamental. En este campo laboral el profesor de educación física puede <strong>trabajar en equipos interdisciplinarios</strong> con psicólogos, psiquiatras, neurólogos, asistentes terapéuticos, gerontólogos, entre otros.
              </p>
            </div>
          </div>

          <LoadingAnchor className="btn-cta grad2" href='/Especializaciones'>
            Especializaciones
          </LoadingAnchor>
        </div>

        <div className={styles.imgCont}>
          <img src={intro} alt="" />
        </div>
      </div >
    </div>
  )
}

export default Intro