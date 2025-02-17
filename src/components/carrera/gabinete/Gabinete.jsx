import React, { useEffect, useRef } from 'react';
import styles from './Gabinete.module.scss'
 
const Gabinete = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seleccion elementos a animar:
    const cont = container.querySelectorAll('*');

    // Array
    const animatedElements = [...cont].filter(Boolean);

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
            <h4>I.S.E.F. San Luís | Nuestro compromiso institucional</h4>
            <h2>Gabinete de <span>apoyo psicológico</span></h2>
            <div className="linea-svg bl"></div>
            <p>
                Pensando siempre en tu formación, nuestro profesorado dispone de un gabinete de apoyo psicopedagógico <strong>gratuito</strong> para acompañarte en el estudio. Así, tus conflictos se transformarán en fortalezas y tu trayecto por esta casa de estudios va a ser una experiencia realmente agradable sin descuidar tus conocimientos. <span>Pedí turnos en secretaría</span>.
            </p>
        </div>
    )
}

export default Gabinete