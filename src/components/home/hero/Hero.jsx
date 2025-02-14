import React, { useEffect, useRef } from 'react';
import styles from './Hero.module.scss';
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';
import fbFooter from '@/assets/simbols/fbFooter.webp'
import igFooter from '@/assets/simbols/igFooter.webp'

const Hero = () => {

    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Seleccion elementos a animar:
        const titulo = container.querySelector(`.${styles.titulo}`);
        const redes = container.querySelector(`.${styles.redes}`);
        const redesChildren = container.querySelectorAll(`.${styles.red}`);

        // Array
        const animatedElements = [titulo, redes, ...redesChildren].filter(Boolean);
    
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

            <div className={styles.titulo}>
                <h3>Profesorado de Educación Física</h3>
                <h1>Desde 1993,
                    <br />
                    <span>abriendo caminos</span>
                </h1>

                <LoadingAnchor className='btn-cta grad2' href='/Carrera'>
                    Educación física
                </LoadingAnchor>
            </div>


            <div className={styles.redes}>
                <a
                    className={styles.red}
                    href="https://www.facebook.com/Isefsanluis.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className={styles.icon}>
                        <img src={fbFooter} alt="Facebook Información General" />
                    </div>
                    <div className={styles.txtCont}>
                        <p>Información <br />General</p>
                    </div>
                </a>

                <a
                    className={styles.red}
                    href="https://www.instagram.com/Isefsanluis.info/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className={styles.icon}>
                        <img src={igFooter} alt="Instagram San Luis" />
                    </div>
                    <div className={styles.txtCont}>
                        <p>Información <br />General</p>
                    </div>
                </a>

                <a
                    className={styles.red}
                    href="https://www.facebook.com/isef.sanluis"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className={styles.icon}>
                        <img src={fbFooter} alt="Facebook San Luís" />
                    </div>
                    <div className={styles.txtCont}>
                        <p>San Luís</p>
                    </div>
                </a>

                <a
                    className={styles.red}
                    href="https://www.facebook.com/isef.villamercedes/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <div className={styles.icon}>
                        <img src={fbFooter} alt="Facebook Villa Mercedes" />
                    </div>
                    <div className={styles.txtCont}>
                        <p>Villa <br />Mercedes</p>
                    </div>
                </a>
            </div>
        </div>

    )
}

export default Hero