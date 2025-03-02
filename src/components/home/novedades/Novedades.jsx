import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './Novedades.module.scss';
import Estructura from './Estructura.jsx';
import loadImages from './novedadLista';

const Novedades = () => {
  const [novedades, setNovedades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadImages();
      setNovedades(data);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.titulo}>
        <h2>Las <span className="color1">últimas noticias</span></h2>
        <div className="linea-svg"></div>
        <p>Enterate qué hay de nuevo en el profesorado: especializaciones, cambios institucionales y más</p>
      </div>
      {novedades.length > 0 && (
        <Swiper
          id='novedades'
          className={`${styles.swiper} bl`}
          modules={[Navigation, Pagination]}
          // initialSlide={Math.floor(novedades.length / 2)}
          centeredSlides={true}
          spaceBetween={40}
          loop={false}
          navigation={{ enabled: true }}
          pagination={{ clickable: true }}
          breakpoints={{
            0: {
              navigation: { enabled: false },
            },
            1400: {
              navigation: { enabled: true },
            },
          }}
        >
          {novedades.map((news, index) => (
             <SwiperSlide key={index} className={styles.swiperSlide}>
             {news.videoPath ? ( 
               <video
                 src={news.videoPath}
                 controls
                 autoPlay
                 loop
                 muted
                 className={styles.videoSlide}
               />
             ) : (
               <Estructura {...news} />
             )}
           </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default Novedades;
