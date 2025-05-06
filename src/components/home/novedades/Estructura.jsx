import React, { useEffect, useRef } from "react";
import styles from "./Novedades.module.scss";
import ScrollToSection from "@/components/funciones/scroll/ScrollToSection";

const Estructura = ({ title, type = 1, description, page, id, imagePath }) => {
  const overlayStyle = {
    background: `linear-gradient(rgba(0,0,0,0.9), rgba(var(--principal-rgb) 0.4)), url(${imagePath})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };

  const containerRef = useRef(null);

  // Diccionario de tipos
  const typeTxt = {
    1: "Novedades",
    2: "Nuevo curso",
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seleccion elementos a animar:
    const animatedElements = container.querySelectorAll(`.${styles.info}`);

    // IntersectionObserver
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.swiperSlide}>
      <div className={styles.overlay} style={overlayStyle}>
        <h4 className={styles.info}>{typeTxt[type] || ""}</h4>
        <h2 className={styles.info}>{title}</h2>
        <div className={`${styles.info} linea-svg bl`}></div>
        <p className={styles.info}>{description}</p>
        <ScrollToSection
          className={`${styles.info} btn-cta grad3`}
          page={page}
          id={id}
        >
          Ver más
        </ScrollToSection>
      </div>
    </div>
  );
};

export default Estructura;
