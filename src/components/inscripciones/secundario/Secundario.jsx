import React, { useEffect, useRef } from 'react';
import styles from './Secundario.module.scss'

const Secundario = () => {
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
        <div className={`${styles.container} bl`}>
            <div ref={containerRef} className={styles.txtCont}>
                <h2>
                    ¿Recién te egresás del <span>secundario</span>?
                </h2>
                <div className={`${styles.linea} linea-svg bl`}></div>
                <p>
                    No te preocupes, tenés hasta el <strong>30 de Julio</strong> para sacar todas las materias que adeudes.
                    <br />
                    <strong>
                        Después de esta fecha, ya no podrás seguir cursando
                    </strong>
                </p>
            </div>

            <div className={styles.calendar}>
                <div className={styles.calendar__month}>Julio</div>
                <div className={styles.calendar__day}>30</div>
            </div>
        </div>
    )
}

export default Secundario
