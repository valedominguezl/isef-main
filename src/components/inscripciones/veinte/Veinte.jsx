import React, { useEffect, useRef } from 'react';
import styles from './Veinte.module.scss'
import resolucion from '/requisitos/Resolucion 25 años.docx?url';
import material from '/requisitos/Material 25 años.docx?url';
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';

const Veinte = () => {
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
        <div ref={containerRef} className={styles.container}>

            <div className={styles.txtCont}>
                <h2>Para <span>mayores de 25</span> años sin secundario</h2>
                <div className="linea-svg"></div>
                <p>Alumnos sin título secundario y mayores de 25 años también podrán inscribirse en la carrera luego de realizar un <strong>examen de conocimientos generales</strong>.</p>
            </div>

            <LoadingAnchor href={resolucion} download className="btn-cta download grad4">
                Resolución
            </LoadingAnchor>

            <LoadingAnchor href={material} download className="btn-cta download grad4">
                Material de estudio
            </LoadingAnchor>

        </div>
    )
}

export default Veinte