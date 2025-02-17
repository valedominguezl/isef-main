import React, { useEffect, useRef } from 'react';
import styles from './Intro.module.scss'
import intro from '@/assets/media/especializaciones/intro.webp'

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
            <h4>I.S.E.F. San Luís | Cómo te hacemos destacar</h4>
            <h2>Te formamos con las<br /><span className="color2">últimas novedades</span></h2>
          </div>
          <div className="linea-svg"></div>
          <div className={styles.parrafos}>
            <p>            
              La <strong>intervención de las enfermedades debe empezar en la niñez</strong>; la obesidad se ha relacionado con un mayor riesgo de desarrollar trece tipos de cáncer, entre ellos: adenocarcinoma de esófago, <strong>cáncer de mama</strong> en mujeres postmenopáusicas, cáncer de colon y recto, cáncer de útero (matriz), cáncer de vesícula, cáncer de estómago (parte superior), cáncer de riñones, cáncer de hígado, cáncer de ovario, cáncer de páncreas, <strong>cáncer de tiroides</strong>, meningioma (un tipo de cáncer del cerebro), mieloma múltiple, etc. <br /> <br />

              Las neurociencias, pilar fundamental en esta formación, te brindan herramientas para comprender <strong>cómo el cerebro responde al ejercicio</strong> y cómo influye en el desarrollo cognitivo, emocional y físico permitiendo un abordaje profundo y eficaz en la enseñanza y promoción de hábitos saludables, adaptándose a las necesidades de cada etapa de desarrollo. <br /> <br />

              Mediante nuestros talleres de especialización dictados por <strong>científicos de renombre mundial</strong>, te ofrecemos una formación integral con <strong>temáticas actualizadas</strong> que combinan ciencias del deporte y neurociencias. Algunos destacados incluyen “Entrenamiento de la fuerza”, donde verás los principios fundamentales y prácticos del entrenamiento de fuerza en el gimnasio, o “Actividad física en el adulto mayor”, enfocado en mejorar la calidad de vida en la vejez. Por eso, en el I.S.E.F. San Luís, te abrimos <strong>caminos nunca antes pensados</strong>.
            </p>
          </div>
        </div>
      </div>

      <img src={intro} alt="" />
    </div>
  )
}

export default Intro