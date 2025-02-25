import React, { useEffect, useRef } from 'react';
import styles from './Datos.module.scss'
import titulo from '@/assets/simbols/titulo.webp'
import duracion from '@/assets/simbols/duracion.webp'
import modalidad from '@/assets/simbols/modalidad.webp'
import cursado from '@/assets/simbols/cursado.webp'
import horarios from '@/assets/simbols/horarios.webp'
import validez from '@/assets/simbols/años.webp'

const Datos = () => {

    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Seleccion elementos a animar:
        const titulo = container.querySelector(`.${styles.txtCont}`);
        const datos = container.querySelector(`.${styles.datos}`);
        const datosChildren = container.querySelectorAll(`.${styles.dato}`);

        // Array
        const animatedElements = [titulo, datos, ...datosChildren].filter(Boolean);
    
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

            <div className={`${styles.txtCont} bl`}>
                <h2>Información <span>general</span></h2>
                <div className="linea-svg bl"></div>
            </div>

            <div className={styles.datos}>

                <div className={styles.dato}>
                    <img src={titulo} alt="" />
                    <div className={styles.datoTxt}>
                        <h3>Título: <strong>profesor/a de educación física</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <img src={duracion} alt="" />
                    <div className={styles.datoTxt}>
                        <h3>Duración: <strong>4 años</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <img src={modalidad} alt="" />
                    <div className={styles.datoTxt}>
                        <h3>Modalidad: <strong>presencial</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <img src={cursado} alt="" />
                    <div className={styles.datoTxt}>
                        <h3>Cursado: <strong>de lunes a viernes</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <img src={horarios} alt="" />
                    <div className={styles.datoTxt}>
                        <h3>Horarios: <strong>de 07:30hs a 13:30hs</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <img src={validez} alt="" />
                    <div className={styles.datoTxt}>
                        <h3>Validez: <strong>nacional e internacional</strong></h3>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Datos