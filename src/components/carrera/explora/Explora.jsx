import React, { useEffect, useRef } from 'react';
import styles from './Explora.module.scss'
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor'

const Explora = () => {
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
    <div ref={containerRef} className={styles.container}>
      <div className={styles.txt}>
        <div className={styles.titulo}>
          <h3>I.S.E.F. San Luís | Actividades y deportes regionales</h3>
          <h2>Exploramos <span className="color2">lo lindo que es San Luís</span></h2>
        </div>
        <div className="linea-svg"></div>
        <div className={styles.parrafos}>
          <p>
            La docencia en las escuelas es un campo laboral muy limitado, en su lugar los territorios laborales de deportes, adulto mayor, enfermedades crónicas no transmisibles, nutrición deportiva, entrenamiento de alto rendimiento y estas actividades regionales que tienen que ver con el turismo son una <strong>fuente laboral virgen y de altos ingresos</strong> que no se pueden comparar con la docencia. <br /> <br />

            <strong>"Actividades y deportes regionales"</strong> es un trayecto integrador de todas las disciplinas de naturaleza y tiempo libre articuladas como contenido transversal desde primero a cuarto año de la carrera concluyendo con una <strong>residencia integradora</strong> en el espacio curricular <strong>"Vida en la naturaleza"</strong>. Un polo turístico tan importante debe estar poblado por emprendimientos para la práctica de canotaje, kayak, windsurf, trekking, ciclismo de montaña, rapel, tirolesa, escalada, entre otras. En este trayecto vas a poner en práctica conocimientos adquiridos de distintos espacios curriculares en los <strong>lugares más turísticos de San Luis</strong>. Los <strong>campamentos recreativos</strong> incluyen, por nombrar algunos: palestra, senderismo, kayak, trekking, rapel, tirolesa, escalada, canotaje, mountain bike, montañismo, apnea o buceo libre, hidrospeed y remo.
          </p>
        </div>
      </div>
    </div >
  )
}

export default Explora