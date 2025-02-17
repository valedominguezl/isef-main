import React, { useEffect, useRef } from 'react';
import styles from './Intro.module.scss'
import intro from '@/assets/media/home/intro.webp'
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
            <h4>I.S.E.F. San Luís | Profesorado de educación física</h4>
            <h2>Bienvenido al <span className="color2">I.S.E.F.</span></h2>
          </div>
          <div className="linea-svg"></div>
          <div className={styles.parrafos}>
            <p>
              En un pueblo con educación reina la armonía, los afectos, la contención. En un pueblo con educación, construir un futuro exitoso es posible. En el I.S.E.F. San Luís, con un equipo de excelentes docentes, te damos las herramientas para lograrlo. <strong>30 años educando con amor </strong>brindándote las herramientas necesarias para abordar una <strong>gran cantidad de campos laborales</strong> legítimos de nuestra profesión dentro y fuera del sistema educativo. <br /> <br />

              No tenés que coartarte la libertad de hacer realidad tu sueño e irte a otra provincia, lejos de tu familia, de tus hijos, de quienes pueden acompañarte en el proceso de hacerte un profesional con todas las armas para enfrentar el mundo. Se trata de <strong>ser feliz mientras estudiás junto a los tuyos</strong> y nosotros te brindamos esa posibilidad formándote con las mejores herramientas para <strong>ejercer en la provincia, en el país, en latinoamérica o en el resto del mundo</strong>.
            </p>

          </div>
        </div>
        <LoadingAnchor href="/Carrera" className='btn-cta grad' >
          Enterate más
        </LoadingAnchor>
      </div>

      <img src={intro} alt="" />
    </div>
  )
}

export default Intro