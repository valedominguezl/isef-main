import React, { useEffect, useRef } from "react";
import styles from "./Requisitos.module.scss";
import ScrollToSection from "@/components/funciones/scroll/ScrollToSection";
import LoadingAnchor from "@/components/funciones/loadingBar/LoadingAnchor";

import inscripcion from "@/assets/simbols/inscripcion.webp";
import medico from "@/assets/simbols/medico.webp";
import banco from "@/assets/simbols/banco.webp";

import solicitud from "/requisitos/Solicitud de inscripcion.doc?url";
import examenes from "/requisitos/Examenes medicos.doc?url";

const Requisitos = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animatedElements = container.querySelectorAll(`.${styles.requisito}`);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(animatedElements).indexOf(entry.target);
            setTimeout(() => {
              entry.target.classList.add(styles.visible);
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.txtContTl}>
        <h2>
          Requisitos <span className="color1">a presentar</span>
        </h2>
        <div className="linea-svg"></div>
        <p>
          Para poder inscribirte en el profesorado, tenés que{" "}
          <strong>descargar</strong> la siguiente documentación,{" "}
          <strong>rellenarla</strong> y luego <strong>presentarla</strong> en la {' '}
          <ScrollToSection page="/Institucional/Contacto" id="mapaContacto">
            sede correspondiente
          </ScrollToSection> {' '}
          del I.S.E.F. San Luís.
        </p>
      </div>

      <div className={styles.requisitos}>
        <div className={styles.requisito}>
          <div className={styles.paso}>
            <h4>#1</h4>
          </div>

          <div className={styles.txtCont}>
            <div className={styles.txt}>
              <h3>
                Ficha de <span className="color1">inscripción</span>
              </h3>
              <div className="linea-svg"></div>
              <p>
                Tenés que llenarla con tus datos personales y llevarla
                personalmente a nuestras oficinas en una{" "}
                <strong>carpeta colgante color marrón</strong>.
              </p>
            </div>
            <LoadingAnchor
              href={solicitud}
              download
              className="btn-cta grad download"
            >
              Descargar
            </LoadingAnchor>
          </div>

          <div className={styles.imgCont}>
            <img src={inscripcion} alt="" />
          </div>
        </div>

        <div className={styles.requisito}>
          <div className={styles.paso}>
            <h4>#2</h4>
          </div>

          <div className={styles.txtCont}>
            <div className={styles.txt}>
              <h3>
                Exámenes <span className="color2">médicos</span>
              </h3>
              <div className="linea-svg"></div>
              <p>
                Tenés que imprimirla y presentarla en los{" "}
                <strong>
                  centros de salud, médicos particulares u hospitales públicos
                </strong>{" "}
                para realizarte los estudios que en ella figuran. La planilla
                consta de tres hojas en <strong>formato A4</strong>.
              </p>
            </div>
            <LoadingAnchor
              href={examenes}
              download
              className="btn-cta grad2 download"
            >
              Descargar
            </LoadingAnchor>
          </div>

          <div className={styles.imgCont}>
            <img src={medico} alt="" />
          </div>
        </div>

        <div className={styles.requisito}>
          <div className={styles.paso}>
            <h4>#3</h4>
          </div>

          <div className={styles.txtCont}>
            <div className={styles.txt}>
              <h3>
                Reservar <span>banco</span>
              </h3>
              <div className="linea-svg"></div>
              <p>
                Los cupos están limitados al{" "}
                <strong>espacio disponible en nuestras aulas</strong>, por esto,
                solo reservamos vacantes con el abono matrícula.
              </p>
            </div>
            {/* <LoadingAnchor href="/Aranceles" target='_blank' className="btn-cta grad4">
              Aranceles
            </LoadingAnchor> */}
          </div>

          <div className={styles.imgCont}>
            <img src={banco} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requisitos;
