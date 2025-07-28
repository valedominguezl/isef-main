import React, { useEffect, useRef } from "react";
import styles from "./Cuerpo.module.scss";
import nelio from "@/assets/media/especializaciones/profesionales/nelioLogo.webp";
import roig from "@/assets/media/especializaciones/profesionales/roigLogo.webp";
import rosler from "@/assets/media/especializaciones/profesionales/roslerLogo.webp";
import walter from "@/assets/media/especializaciones/profesionales/walter.webp";

import LoadingAnchor from "@/components/funciones/loadingBar/LoadingAnchor";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const profesionales = [
  {
    nombre: "Dr. Nelio Bazán",
    img: nelio,
    descripcion: [
      "Médico",
      "Especializado en medicina del deporte",
      "Egresado de la UBA",
      "Docente en la UNR",
      "Co - director en French Clay Tenis",
      "Conferencista",
    ],
    cvLink:
      "https://docs.google.com/document/d/1QtxtySVFjnpRzB1e1UXTJjKsCeSrCmff/edit?usp=sharing&ouid=104941986694218560787&rtpof=true&sd=true",
  },
  {
    nombre: "Dr. Jorge Roig",
    img: roig,
    descripcion: [
      "Doctor en ciencias del ejercicio",
      "Licenciado en educación física",
      "Egresado de la UNLP",
      "Revisor científico",
      "Conferencista",
      "Catedrático",
    ],
    cvLink:
      "https://docs.google.com/document/d/117JLa2ozMPOQA8svpJUPWjVnPDnjHOk8/edit?usp=sharing&ouid=104941986694218560787&rtpof=true&sd=true",
  },
  {
    nombre: "Dr. Roberto Rosler",
    img: rosler,
    descripcion: [
      "Médico",
      "Neurocientífico",
      "Egresado de la UBA",
      "Miembro de la asociación educar",
      "Conferencista",
      "Capacitador docente",
    ],
    cvLink:
      "https://docs.google.com/document/d/11ZTbfKO9EX_wrErNIL0ux8G9sIs97G_g/edit?usp=sharing&ouid=104941986694218560787&rtpof=true&sd=true",
  },

  {
    nombre: "Dr. Walter Agüero",
    img: walter,
    descripcion: [
      "Dr. en ing. informática",
      "Magíster en ing. del software",
      "Egresado de la UNSL",
      "Cybersecurity Specialist",
      "Conferencista",
      "Docente e investigador",
    ],
    cvLink:
      "https://docs.google.com/document/d/11ZTbfKO9EX_wrErNIL0ux8G9sIs97G_g/edit?usp=sharing&ouid=104941986694218560787&rtpof=true&sd=true",
  },
];

const Cuerpo = () => {
  const containerRef = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const effect = effectRef.current;
    if (!container && !effect) return;

    // Selecciona elementos a animar
    const titulo = container?.querySelector(`.${styles.titulo}`);
    const profesionalesChildren = effect?.querySelectorAll(
      `.${styles.profesional}`
    );

    // Filtra y agrupa los elementos que necesitan animación
    const animatedElements = [titulo, ...profesionalesChildren].filter(Boolean);

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
    <div className={styles.container} ref={containerRef}>
      <div className={styles.titulo}>
        <h2>
          Conocé a los <span className="color1">científicos</span>
        </h2>
        <div className="linea-svg"></div>
        <p>
          Estos serán los encargados de impulsar tu carrera, para que estés{" "}
          <strong>a la altura de los estándares europeos</strong>.
        </p>
      </div>

      <div className={styles.profesionales} ref={effectRef}>
        {profesionales.map((profesional, index) => (
          <div key={index} className={styles.profesional}>
            <h3>
              <strong>{profesional.nombre}</strong>
            </h3>

            <div className={styles.txtCont}>
              <div className={styles.imgCont}>
                <img src={profesional.img} alt={profesional.nombre} />
              </div>

              <ul>
                {profesional.descripcion.map((desc, i) => (
                  <li key={i}>
                    <p>{desc}</p>
                  </li>
                ))}
                <li>
                  <LoadingAnchor href={profesional.cvLink} target="_blank">
                    Ver CV completo
                  </LoadingAnchor>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>

      <Swiper
        className={styles.swiperCont}
        centeredSlides={true}
        spaceBetween={50}
        slidesPerView={1}
        navigation={{ enabled: true }}
        pagination={{ enabled: true, clickable: true }}
        modules={[Navigation, Pagination]}
        breakpoints={{
          0: {
            navigation: { enabled: false },
            pagination: { enabled: true },
          },
          768: {
            navigation: { enabled: true },
            pagination: { enabled: false },
          },
        }}
      >
        {profesionales.map((profesional, index) => (
          <SwiperSlide key={index} className={styles.swiperSlide}>
            <div className={styles.profesional}>
              <div className={styles.imgCont}>
                <img src={profesional.img} alt={profesional.nombre} />
              </div>
              <div className={styles.txtCont}>
                <h3>
                  <strong>{profesional.nombre}</strong>
                </h3>
                <ul>
                  {profesional.descripcion.map((desc, i) => (
                    <li key={i}>
                      <p>{desc}</p>
                    </li>
                  ))}
                  <li>
                    <LoadingAnchor href={profesional.cvLink} target="_blank">
                      Ver CV completo
                    </LoadingAnchor>
                  </li>
                </ul>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Cuerpo;
