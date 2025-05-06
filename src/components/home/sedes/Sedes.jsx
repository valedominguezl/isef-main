import React, { useState, useEffect, useRef } from 'react'
import styles from './Sedes.module.scss'
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';

import ubicacion from '@/assets/simbols/contacto/ubicacion2.webp'
import telefono from '@/assets/simbols/contacto/telefono2.webp'
import mail from '@/assets/simbols/contacto/mail2.webp'
import fb from '@/assets/simbols/contacto/fb2.webp'
import atencion from '@/assets/simbols/contacto/atencion2.webp'

const Sedes = () => {

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seleccion elementos a animar:
    const titulo = container.querySelector(`.${styles.titulo}`);

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
    <div id='homeSedes' ref={containerRef} className={styles.container}>

      <div className={styles.titulo}>
        <h2>Conocé <span className="color1">nuestras sedes</span></h2>
        <div className="linea-svg"></div>
        <p>
          Actualmente, podés encontrarnos tanto en la <strong>sede principal</strong>, ubicada en la Ciudad de San Luís, así como también en la <strong>extensión áulica</strong> ubicada en Villa Mercedes. Podés encontrar más información (como <strong>números de teléfono importantes</strong>) en la sección {' '}

          <LoadingAnchor
            href="/Institucional/Contacto"
            target='_blank'
            rel="noopener noreferrer"
          >
            Contacto.
          </LoadingAnchor>

        </p>
      </div>

      <div className={styles.sedes}>
        <div className={styles.sede}>
          <div className={`${styles.txt} bl`}>
            <h4>Sede principal</h4>
            <h3>Ciudad de San Luís</h3>
          </div>

          <div className={styles.contactos}>
            <div className={styles.contacto}>
              <img src={ubicacion} alt="" />
              <p>
                <LoadingAnchor
                  href="https://maps.app.goo.gl/mAtAF9dEStP8UWdK7"
                  target='_blank'
                  rel="noopener noreferrer"
                >
                  Colón 1138, Club Sociedad Española
                </LoadingAnchor>
              </p>
            </div>
            <div className={styles.contacto}>
              <img src={telefono} alt="" />

              <p><a href="https://wa.me/+5492664564435" target='_blank'>
                +54 9 2664 56-4435
              </a></p>
            </div>
            <div className={styles.contacto}>
              <img src={mail} alt="" />
              <p><a href="mailto:esef4@hotmail.com">esef4@hotmail.com</a></p>
            </div>
            <div className={styles.contacto}>
              <img src={fb} alt="" />
              <p>
                <LoadingAnchor
                  href="https://www.fb.com/isefsanluis.info"
                  target='_blank'
                  rel="noopener noreferrer"
                >
                  fb.com/isefsanluis.info
                </LoadingAnchor>
              </p>
            </div>
            <div className={styles.contacto}>
              <img src={atencion} alt="" />
              <p><strong>Atención de 9 a 13hs</strong></p>
            </div>
          </div>
        </div>

        <div className={styles.sede}>

          <div className={`${styles.txt} bl`}>
            <h4>Extensión áulica</h4>
            <h3>Villa Mercedes</h3>
          </div>

          <div className={styles.contactos}>
            <div className={styles.contacto}>
              <img src={ubicacion} alt="" />

              <p>
                <LoadingAnchor
                  href="https://maps.app.goo.gl/mAtAF9dEStP8UWdK7"
                  target='_blank'
                  rel="noopener noreferrer"
                >
                  Pedernera 635 Fundación Eva Perón
                </LoadingAnchor>
              </p>
            </div>
            <div className={styles.contacto}>
              <img src={telefono} alt="" />
              <p><a href="https://wa.me/+5492664564435" target='_blank'>
                +54 9 2664 56-4435
              </a></p>
            </div>
            <div className={styles.contacto}>
              <img src={mail} alt="" />
              <p><a href="mailto:esef4@hotmail.com">esef4@hotmail.com</a></p>
            </div>
            <div className={styles.contacto}>
              <img src={fb} alt="" />
              <p>
                <LoadingAnchor
                  href="https://www.facebook.com/isef.villamercedes/"
                  target='_blank'
                  rel="noopener noreferrer"
                >
                  fb.com/isef.villamercedes
                </LoadingAnchor>
              </p>
            </div>
            <div className={styles.contacto}>
              <img src={atencion} alt="" />
              <p><strong>Atención de 9 a 13hs</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sedes;
