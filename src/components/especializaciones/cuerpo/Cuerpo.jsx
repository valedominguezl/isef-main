import React, { useEffect, useRef } from 'react';
import styles from './Cuerpo.module.scss';
import nelio from '@/assets/media/especializaciones/profesionales/nelioLogo.webp';
import roig from '@/assets/media/especializaciones/profesionales/roigLogo.webp';
import rosler from '@/assets/media/especializaciones/profesionales/roslerLogo.webp';
import scroll from '@/assets/simbols/faqFlechaActive.webp';

import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const profesionales = [
  {
    nombre: 'Dr. Nelio Bazán',
    img: nelio,
    descripcion: [
      'Médico',
      'Especializado en medicina del deporte',
      'Egresado de la UBA',
      'Docente en la UNR',
      'Co - director del centro de entrenamiento French Clay Tenis',
      'Conferencista',
    ],
    cvLink: 'https://docs.google.com/document/d/1UIq49gb1w01KGQbo09r-9Dku5wTCCsev/edit?usp=sharing&ouid=104941986694218560787&rtpof=true&sd=true'
  },
  {
    nombre: 'Lic. Jorge Roig',
    img: roig,
    descripcion: [
      'Licenciado en educación física',
      'Doctorado en ciencias del ejercicio',
      'Egresado de la UNLP',
      'Revisor científico',
      'Conferencista',
      'Catedrático',
    ],
    cvLink: 'https://docs.google.com/document/d/117JLa2ozMPOQA8svpJUPWjVnPDnjHOk8/edit?usp=sharing&ouid=104941986694218560787&rtpof=true&sd=true'
  },
  {
    nombre: 'Dr. Roberto Rosler',
    img: rosler,
    descripcion: [
      'Médico',
      'Neurocientífico',
      'Egresado de la UBA',
      'Miembro de la asociación educar',
      'Conferencista',
      'Capacitador docente'
    ],
    cvLink: 'https://docs.google.com/document/d/11ZTbfKO9EX_wrErNIL0ux8G9sIs97G_g/edit?usp=sharing&ouid=104941986694218560787&rtpof=true&sd=true'
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
    const profesionalesChildren = effect?.querySelectorAll(`.${styles.profesional}`);

    // Filtra y agrupa los elementos que necesitan animación
    const animatedElements = [titulo, ...profesionalesChildren].filter(Boolean);

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


  useEffect(() => {
    const containers = document.querySelectorAll(`.${styles.profesional}`);
    const removeOverlays = () => {
      const scroll = document.querySelectorAll(`.${styles.scroll}`);
      scroll.forEach(overlay => {
        overlay.style.display = 'none';
      });
    };

    containers.forEach(container => {
      container.addEventListener('scroll', removeOverlays);
      container.addEventListener('touchstart', removeOverlays);
      container.addEventListener('mousedown', removeOverlays);
    });

    // Cleanup
    return () => {
      containers.forEach(container => {
        container.removeEventListener('scroll', removeOverlays);
        container.removeEventListener('touchstart', removeOverlays);
        container.removeEventListener('mousedown', removeOverlays);
      });
    };
  }, []);



  return (
    <div className={styles.container} ref={containerRef}>

      <div className={styles.titulo}>
        <h2>Conocé a los <span className="color1">científicos</span></h2>
        <p>Estos serán los encargados de impulsar tu carrera, para que estés <strong>a la altura de los estándares europeos</strong>.</p>
      </div>

      <div className={styles.profesionales} ref={effectRef}>
        {profesionales.map((profesional, index) => (
          <div key={index} className={styles.profesional}>
            <div className={styles.imgCont}>
              <img src={profesional.img} alt={profesional.nombre} />
            </div>
            <div className={styles.txtCont}>
              <h3><span>{profesional.nombre}</span></h3>
              <ul>
                {profesional.descripcion.map((desc, i) => (
                  <li key={i}><p>{desc}</p></li>
                ))}
                <li>
                  <LoadingAnchor
                    href={profesional.cvLink} target="_blank">
                    <strong>Ver CV completo</strong>
                  </LoadingAnchor>
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>

      <Swiper
        className={styles.swiperCont}
        spaceBetween={20}
        slidesPerView={1}
        navigation={true}
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
      >
        {profesionales.map((profesional, index) => (
          <SwiperSlide key={index} className={styles.swiperSlide}>
            <div className={styles.profesional}>
              <div className={`${styles.scroll} bl`}>
                <p>Deslizá para ver más</p>
                <img src={scroll} alt="Deslizá para ver más" />
              </div>
              <div className={styles.imgCont}>
                <img src={profesional.img} alt={profesional.nombre} />
              </div>
              <div className={styles.txtCont}>
                <h3><span>{profesional.nombre}</span></h3>
                <ul>
                  {profesional.descripcion.map((desc, i) => (
                    <li key={i}><p>{desc}</p></li>
                  ))}
                  <li>
                    <LoadingAnchor href={profesional.cvLink} target="_blank"><strong>Ver CV completo</strong></LoadingAnchor>
                  </li>
                </ul>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
}

export default Cuerpo;
