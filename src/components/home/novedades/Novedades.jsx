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
      <Swiper
        id='novedades'
        className={`${styles.swiper} bl`}
        modules={[Navigation, Pagination]}
        centeredSlides={true}
        spaceBetween={30}
        loop={true}
        navigation={{ enabled: true }}
        pagination={{ enabled: true, clickable: true }}
      >
        {novedades.map((news, index) => (
          <SwiperSlide key={index} className={styles.swiperSlide}>
            <Estructura {...news} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Novedades;
