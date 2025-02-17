import React, { useEffect, useRef } from 'react';
import styles from './Intro.module.scss'
import intro from '@/assets/media/carrera/intro.webp'
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor'

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
    <div ref={containerRef} className={styles.container}>
      <div className={styles.txtCont}>
        <div className={styles.txt}>
          <div className={styles.titulo}>
            <h4>I.S.E.F. San Luís | Sobre la salida laboral</h4>
            <h2>Te necesitan, <span className="color2">profesor</span></h2>
          </div>
          <div className="linea-svg"></div>
          <div className={styles.parrafos}>
            <p>
              Gracias a el I.S.E.F. San Luís, <span>sos necesario</span>. Con los {' '}
              <LoadingAnchor href="/Especializaciones">
                <span>talleres de especialización</span>
              </LoadingAnchor>
              {' '}que te ofrecemos de manera gratuita vas a poder ejercer en equipos interdisciplinarios en centros de salud, gimnasios, clubes, clínicas, hospitales, y mucho más. <br /> <br />

              Nosotros te damos herramientas para que seas capaz de <span>mucho más que la docencia</span>. Vas a trabajar en el club, en el gimnasio, en la pileta, atendiendo a ciclistas, maratonistas, practicantes de artes marciales, de danzas, de patinaje, en <span>centros de alto rendimiento</span>, centros de salud, ayudando a los kinesiólogos en la reinserción deportiva. Los egresados del I.S.E.F., están en <span>todos lados, mucho más allá de las escuelas</span>.</p>
          </div>
        </div>
        <LoadingAnchor href="/Especializaciones" className='btn-cta grad' target='_blank'>
          Ver talleres
        </LoadingAnchor>
      </div>

      <img src={intro} alt="" />
    </div>
  )
}

export default Intro