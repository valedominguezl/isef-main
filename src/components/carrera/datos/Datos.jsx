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
        <div ref={containerRef} className={styles.container}>

            <div className={styles.txtCont} >
                <h2>Información <span className='color1'>general</span></h2>
                <div className="linea-svg"></div>
            </div>

            <div className={styles.datos}>

                <div className={styles.dato}>
                    <div className={styles.datoImg}>
                        <img src={titulo} alt="" />
                    </div>

                    <div className={styles.datoTxt}>
                        <h3>Título:</h3>
                        <h3><strong>profesor/a de educación física</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.datoImg}>
                        <img src={duracion} alt="" />
                    </div>

                    <div className={styles.datoTxt}>
                        <h3>Duración:</h3>
                        <h3><strong>4 años</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.datoImg}>
                        <img src={modalidad} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Modalidad:</h3>
                        <h3><strong>presencial</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.datoImg}>
                        <img src={cursado} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Cursado:</h3>
                        <h3><strong>de lunes a viernes</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.datoImg}>
                        <img src={horarios} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Horarios:</h3>
                        <h3><strong>de 07:30hs a 13:30hs</strong></h3>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.datoImg}>
                        <img src={validez} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Validez:</h3>
                        <h3><strong>nacional e internacional</strong></h3>
                    </div>
                </div>

            </div>



        </div>
    )
}

export default Datos