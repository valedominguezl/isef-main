import React, { useState, useEffect, useRef } from 'react'
import styles from './Sedes.module.scss'
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';

import ubicacion from '@/assets/simbols/contacto/ubicacion.webp'
import telefono from '@/assets/simbols/contacto/telefono.webp'
import mail from '@/assets/simbols/contacto/mail.webp'
import fb from '@/assets/simbols/contacto/fb.webp'
import atencion from '@/assets/simbols/contacto/atencion.webp'

const Sedes = () => {

  const [activeButton, setActiveButton] = useState('sanluis');

  const handleButtonClick = (button) => {
    setActiveButton(button);
  };

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seleccion elementos a animar:
    const titulos = container.querySelector(`.${styles.titulos}`);

    // Array
    const animatedElements = [titulos].filter(Boolean);

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

      <div className={styles.titulos}>
        <div className={styles.selector}>

          <div className={styles.btn}>
            <button
              className={`btn-cta  ${activeButton === 'sanluis' ? styles.active : styles.inactive}`}
              onClick={() => handleButtonClick('sanluis')}
            >
              <h3>San Luís</h3>
            </button>
          </div>

          <div className={styles.btn}>
            <button
              className={`btn-cta  ${activeButton === 'villamercedes' ? styles.active : styles.inactive}`}
              onClick={() => handleButtonClick('villamercedes')}
            >
              <h3>Villa Mercedes</h3>
            </button>
          </div>

        </div>
      </div>

      {activeButton && (
        <div className={`${styles.sede} bl`}>
          <div
            className={`${styles.sedeTxt} 
          ${activeButton === 'sanluis' ? `${styles.active} ${styles.sanLuis}` : ''}  
          ${activeButton === null ? styles.inactive : ''}`}
          >
            <div className={styles.txt}>
              <div className={styles.titulo}>
                <h4>Sede principal</h4>
                <h3>Ciudad de San Luís</h3>
              </div>
              <div className="linea-svg bl"></div>
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
                  <p>+54 2664564435</p>
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
          </div>

          <div
            className={`${styles.sedeTxt} 
          ${activeButton === 'villamercedes' ? `${styles.active} ${styles.villaMercedes}` : ''}  
          ${activeButton === null ? styles.inactive : ''}`}
          >            <div className={styles.txt}>
              <div className={styles.titulo}>
                <h4>Extensión áulica</h4>
                <h3>Villa Mercedes</h3>
              </div>
              <div className="linea-svg bl"></div>
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
                  <p>+54 2664564435</p>
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

          <div
            className={`${styles.imgCont} ${activeButton === 'villamercedes' ? styles.moveLeft : ''}`}
          >
            <div className={styles.botonImg}>
              <LoadingAnchor
                href={activeButton === 'sanluis' ? 'https://maps.app.goo.gl/mAtAF9dEStP8UWdK7' : 'https://maps.app.goo.gl/hG4cCF2RyTHnie8AA'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta grad3"
                style={{ textDecoration: 'underline', textUnderlineOffset: '5px', }}
              >
                Ver en el mapa
              </LoadingAnchor>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sedes;
