import React, { useEffect, useRef } from 'react';
import styles from './Intro.module.scss'
import titulo from '@/assets/simbols/titulo.webp'

const Intro = () => {

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
                <h2>Teléfonos <span>de contacto</span></h2>
                <div className="linea-svg bl"></div>
            </div>

            <div className={styles.datos}>
 
                <div className={styles.dato}>
                    <div className={styles.imgCont}>
                        <img src={titulo} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Información general</h3>
                        <div className="linea-svg bl"></div>
                        <p><a href="https://wa.me/5492664564435">+54 9 2664 56-4435</a></p>
                        <p>Tu primera opción si tenés consultas generales o si no sabés con qué número contactarte</p>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.imgCont}>
                        <img src={titulo} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Rectoría</h3>
                        <div className="linea-svg bl"></div>
                        <p><a href="https://wa.me/5492604508428" target='_blank'>+54 9 2604 50-8428</a></p>
                        <p>Es la oficina del rector. Para quejas, sugerencias o asuntos institucionales importantes.</p>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.imgCont}>
                        <img src={titulo} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Secretaría académica</h3>
                        <div className="linea-svg bl"></div>
                        <p><a href="https://wa.me/5492664570570" target='_blank'>+54 9 2664 57-0570</a></p>
                        <p>Por temas pedagógicos, problemas con docentes o información del gabinete de apoyo psicológico</p>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.imgCont}>
                        <img src={titulo} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Secretaría administrativa</h3>
                        <h4>(San Luís)</h4>
                        <div className="linea-svg bl"></div>
                        <p><a href="https://wa.me/5492664304739" target='_blank'>+54 9 2664 30-4739</a></p>
                        <p><a href="https://wa.me/5492664611345" target='_blank'>+54 9 2664 61-1345</a></p>
                        <p><a href="https://wa.me/5492664577972" target='_blank'>+54 9 2664 57-7972</a></p>
                        <p>Por temas como: asistenicas, calificaciones, cuotas, certificaciones, etc, en la sede de San Luís</p>
                    </div>
                </div>

                <div className={styles.dato}>
                    <div className={styles.imgCont}>
                        <img src={titulo} alt="" />
                    </div>
                    <div className={styles.datoTxt}>
                        <h3>Secretaría administrativa</h3>
                        <h4>(Villa Mercedes)</h4>
                        <div className="linea-svg bl"></div>
                        <p><a href="https://wa.me/5492657210254" target='_blank'>+54 9 2657 21-0254</a></p>
                        <p>Por temas como: asistenicas, calificaciones, cuotas, certificaciones, etc, en la sede de Villa Mercedes</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Intro