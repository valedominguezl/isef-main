import React, { useEffect, useRef, useState } from 'react';
import styles from './Validez.module.scss';
import imagenes from './validez.js';

const Validez = () => {
    const images = Object.values(imagenes);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    const totalSlides = images.length;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => prevIndex + 1);
            setIsTransitioning(true);
        }, 4000);

        return () => clearInterval(interval);
    }, [totalSlides]);

    useEffect(() => {
        if (currentIndex === totalSlides) {
            setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(0);
            }, 1000);
        }
    }, [currentIndex, totalSlides]);

    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Seleccion elementos a animar:
        const titulo = container.querySelector(`.${styles.txt}`);

        // Array
        const animatedElements = [titulo].filter(Boolean);

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
            <div className={styles.img}>
                <div
                    className={styles.slideshow}
                    style={{
                        transform: `translateX(-${currentIndex * 100}%)`,
                        transition: isTransitioning ? 'transform 1s ease-in-out' : 'none',
                    }}
                >
                    {[...images, images[0]].map((src, index) => (
                        <img key={index} src={src} alt={`Slide ${index}`} />
                    ))}
                </div>
            </div>
            <div className={styles.txt}>
                <h3>I.S.E.F. San Luís | Resolución Nº: 442 ME 2016</h3>
                <h2>
                    Validez <span>nacional e internacional</span>
                </h2>
                <div className="linea-svg bl"></div>
                <p>
                    Tu título te va a permitir trabajar en todo el territorio argentino y en los <span>países del MERCOSUR</span>, para que no <span>pierdas ninguna oportunidad</span>. Consultá la validez nacional del título
                    al 4452000 interno 3309 del Ministerio de Educación de San Luís.
                </p>
            </div>
        </div>
    );
};

export default Validez;
