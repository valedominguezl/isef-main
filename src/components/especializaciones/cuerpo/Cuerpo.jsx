import React, { useEffect, useRef, useState } from "react";
import styles from "./Cuerpo.module.scss";

import nelio from "@/assets/media/especializaciones/profesionales/nelioLogo.webp";
import roig from "@/assets/media/especializaciones/profesionales/roigLogo.webp";
import rosler from "@/assets/media/especializaciones/profesionales/roslerLogo.webp";
import walter from "@/assets/media/especializaciones/profesionales/walter.webp";
import hernan from "@/assets/media/especializaciones/profesionales/hernan.webp";

import LoadingAnchor from "@/components/funciones/loadingBar/LoadingAnchor";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

// mismos íconos que usás en Cursos
import flecha from "@/assets/simbols/faqFlechaActive.webp";
import flechaHover from "@/assets/simbols/faqFlechaInactiveDown.webp";

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
      "https://docs.google.com/document/d/1mLVtcBEoEj83_hyjJW-Ek-KFTfXYsDe-/edit?usp=sharing&ouid=101394837957796627452&rtpof=true&sd=true",
  },

  {
    nombre: "Lic. Hernán Araujo",
    img: hernan,
    descripcion: [
      "Lic. en administración",
      "Magíster en economía y administración",
      "Egresado de la UNSJ",
      "Conferencista",
      "Docente e investigador",
    ],
    cvLink:
      "https://docs.google.com/document/d/1a7zzJu-dT0TkrlEZ-uyFc8kDflUwT7o8/edit?usp=sharing&ouid=101394837957796627452&rtpof=true&sd=true",
  },
];

const Cuerpo = () => {
  const containerRef = useRef(null);
  const effectRef = useRef(null);

  // Desktop: 3 iniciales, luego +5 por click
  const [visibleCount, setVisibleCount] = useState(3);
  const [hover, setHover] = useState(false);

  // Fuerza que los nuevos ítems aparezcan visibles al instante (sin observer)
  const [forceReveal, setForceReveal] = useState(false);

  const isDesktop = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1025px)").matches;

  // Si cambiás a desktop, reseteamos a 3 visibles
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1025px)");
    const handler = (e) => {
      if (e.matches) setVisibleCount(3);
    };
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // Observer para título + cada .profesional actualmente montado
  useEffect(() => {
    const container = containerRef.current;
    const effect = effectRef.current;
    if (!container && !effect) return;

    const titulo = container?.querySelector(`.${styles.titulo}`);
    const profesionalesChildren = effect?.querySelectorAll(
      `.${styles.profesional}`
    );
    const elements = [titulo, ...(profesionalesChildren || [])].filter(Boolean);

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

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleCount]);

  // Si venimos de "Ver más", marcamos visibles YA los montados (incluye nuevos)
  useEffect(() => {
    if (!forceReveal) return;
    const effect = effectRef.current;
    if (!effect) return;

    effect
      .querySelectorAll(`.${styles.profesional}`)
      .forEach((el) => el.classList.add(styles.visible));

    setForceReveal(false);
  }, [forceReveal]);

  // Subconjunto a renderizar en desktop
  const profesionalesDesktop = isDesktop()
    ? profesionales.slice(0, Math.min(visibleCount, profesionales.length))
    : profesionales;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, profesionales.length));
    setForceReveal(true); // aparece inmediatamente
  };

  const canShowMore = isDesktop() && visibleCount < profesionales.length;

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

      {/* Lista para desktop (tu CSS ya la oculta en mobile) */}
      <div className={styles.profesionales} ref={effectRef}>
        {profesionalesDesktop.map((profesional, index) => (
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

      {/* Botón Mostrar más (solo desktop y si hay más para ver) */}
      {canShowMore && (
        <div
          className={styles.showMore}
          role="button"
          aria-label="Mostrar más científicos"
          onClick={handleShowMore}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <img src={hover ? flecha : flechaHover} alt="Mostrar más" />
        </div>
      )}

      {/* Swiper para mobile/tablet (sin cambios) */}
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
