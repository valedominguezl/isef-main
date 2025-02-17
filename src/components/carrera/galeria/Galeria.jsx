import React, { useState, useEffect } from 'react';
import styles from './Galeria.module.scss';
import rotateIcon from '@/assets/simbols/rotateIcon.webp';
import scroll from '@/assets/simbols/click.webp';
import fullscreen from '@/assets/simbols/fullscreen.webp';

import prevButton from '@/assets/simbols/flechaBlLeft.webp';
import nextButton from '@/assets/simbols/flechaBlRight.webp';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';


import captions from './captions'; // Epígrafes

const archivos = import.meta.glob('@/assets/media/carrera/galeria/imagenes/*', { eager: true });
const mediaFiles = Object.keys(archivos).map((key) => ({
  src: archivos[key].default,
  type: key.match(/\.(mp4|webm|ogg)$/) ? 'video' : 'image',
  caption: captions[key.split('/').pop()] || { lugar: '', epigrafe: '' }, // Obtener epígrafe
}));

const Galeria = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [adviceDismissed, setAdviceDismissed] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const totalSlides = mediaFiles.length;

  useEffect(() => {
    const handleResize = () => {
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isPortraitMode);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    // Ejecutar al montar 
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSlideClick = (index) => {
    setCurrentIndex(index);
    setMostrarModal(true);
    setCurrentMedia(mediaFiles[index]);
    if (isPortrait && window.innerWidth < 768 && !adviceDismissed) {
      setShowAdvice(true);
      setTimeout(() => {
        setShowAdvice(false);
        setAdviceDismissed(true);
      }, 3000); // Mostrar por 3 segundos
    }
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    const newIndex = (currentIndex + 1) % totalSlides;
    setCurrentIndex(newIndex);
    setCurrentMedia(mediaFiles[newIndex]);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    setCurrentIndex(newIndex);
    setCurrentMedia(mediaFiles[newIndex]);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 75) { // Deslizar hacia la izquierda 
      nextSlide(e);
    } else if (touchEndX - touchStartX > 75) { // Deslizar hacia la derecha
      prevSlide(e);
    }
  };

  useEffect(() => {
    const containers = document.querySelectorAll(`.${styles.customSlide}`);
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
    <div className={styles.galeriaContainer}>
      {showAdvice && (
        <div className={`${styles.orientationWarning} ${styles.fadeOut}`}>
          <div className={`${styles.rotateIcon} bl`}>
            <img src={rotateIcon} alt="Icono de girar" />
            <p>Girá tu dispositivo para visualizar mejor las imágenes</p>
          </div>
        </div>
      )}

      <div className={styles.slider}>
        <div className={`${styles.scroll} bl`}>
          <p>Ver la galería</p>
          <img src={scroll} alt="Deslizá para ver más" />
        </div>

        <Swiper
          className={styles.swiper}
          spaceBetween={0}
          navigation={{ enabled: true }}
          modules={[Navigation]}
          breakpoints={{
            0: {
              slidesPerView: 1,
              navigation: { enabled: false },
            },

            768: {
              slidesPerView: 2,
              navigation: { enabled: true },
            },

            1300: {
              slidesPerView: 3,
              navigation: { enabled: true },
            }
          }}
        > 
          {mediaFiles.map((file, index) => (
            <SwiperSlide key={index} className={styles.swiperSlide}>
              <div className={styles.swipperWrapper} onClick={() => handleSlideClick(index)}>
                {file.type === 'video' ? (
                  <video
                    src={file.src}
                    className={styles.media}
                    muted
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <img
                    src={file.src}
                    alt={`Slide ${index + 1}`}
                    className={styles.media}
                    loading="lazy"
                  />
                )}

                <div className={styles.fullscreen}>
                  <img src={fullscreen} alt="" />
                </div>

                <div className={`${styles.caption} bl`}>
                  <h4>{file.caption.lugar}</h4>
                  <div className='linea-svg bl'></div>
                  <small>{file.caption.epigrafe}</small>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {mostrarModal && currentMedia && (
        <div
          className={styles.modal}
          onClick={() => setMostrarModal(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* Modal */}
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.prevButton} onClick={prevSlide}>
              <img src={prevButton} alt="" />
            </div>
            <div className={styles.mediaWrapper}>
              <span className={styles.close} onClick={() => setMostrarModal(false)}>
                &times;
              </span>
              {currentMedia.type === 'video' ? (
                <video
                  src={currentMedia.src}
                  className={styles.modalMedia}
                  controls
                  playsInline
                  preload="auto"
                />
              ) : (
                <img
                  src={currentMedia.src}
                  alt={`Slide ${currentIndex + 1}`}
                  className={styles.modalMedia}
                />
              )}

              <div className={`${styles.caption} bl`}>
                <h4>{currentMedia.caption.lugar}</h4>
                <div className='linea-svg bl'></div>
                <div className={styles.numbering}>
                  <small>{currentMedia.caption.epigrafe}</small>
                  <p>{currentIndex + 1} / {totalSlides}</p>
                </div>
              </div>
            </div>
            <div className={styles.nextButton} onClick={nextSlide}>
              <img src={nextButton} alt="" />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Galeria;

