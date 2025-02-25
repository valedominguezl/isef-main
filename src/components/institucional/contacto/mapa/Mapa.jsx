import React, { useEffect, useRef } from 'react';
import styles from './Mapa.module.scss'
import flecha from '@/assets/simbols/faqFlechaActive.webp'

const Mapa = () => {
    const containerRef = useRef(null);
  
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
  
      // Seleccion elementos a animar:
      const titulo = container.querySelector(`.${styles.tituloGral}`);
      const mapa = container.querySelectorAll(`.${styles.mapa}`);
  
      // Array
      const animatedElements = [titulo, ...mapa].filter(Boolean);
  
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
      <div ref={containerRef} id='mapaContacto' className={styles.container}>

            <div className={styles.tituloGral}>
                <h2>Nuestras <span className="color1">sedes</span></h2>
                <div className="linea-svg"></div>
                <p>Hacé click en "Ampliar mapa" para ver cómo llegar a cada una</p>
            </div>
            <div className={styles.mapas}>
                <div className={styles.mapa}>
                    <div className={`${styles.titulo} bl`}>
                        <h3>San Luís</h3>
                        <div className="linea-svg bl"></div>
                        <h4>Sede principal</h4>
                        <img src={flecha} alt="" />

                    </div>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3334.8390831599!2d-66.33809122342238!3d-33.296872589664964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d439525ae507d1%3A0xd9a7144dcb2cc7f0!2sIsef%20San%20Luis!5e0!3m2!1ses-419!2sar!4v1740328985501!5m2!1ses-419!2sar"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>

                <div className={styles.mapa}>
                    <div className={`${styles.titulo} bl`}>
                        <h3>Villa Mercedes</h3>
                        <div className="linea-svg bl"></div>
                        <h4>Extensión áulica</h4>
                        <img src={flecha} alt="" />
                    </div>
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3320.06246869656!2d-65.46731352340814!3d-33.68144660938069!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d16a850fefe5db%3A0x46fe5509d3b440f8!2sIsef%20Villa%20Mercedes!5e0!3m2!1ses-419!2sar!4v1740329416737!5m2!1ses-419!2sar"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </div>
    )
}

export default Mapa
