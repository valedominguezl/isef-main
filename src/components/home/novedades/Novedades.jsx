import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Novedades.module.scss';
import Estructura from './Estructura.jsx';
import novedadLista from './novedadLista.js';

const Novedades = () => {
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
        breakpoints={{
          0: {
            navigation: { enabled: false },
            pagination: { enabled: true },
          },
          550: {
            navigation: { enabled: false },
            pagination: { enabled: true },
          },
          750: {
            navigation: { enabled: true },
            pagination: { enabled: true },
          },
          900: {
            navigation: { enabled: false },
            pagination: { enabled: false },
          },
          1400: {
            navigation: { enabled: true },
            pagination: { enabled: false },
          },
        }}
      >

        {novedadLista.map((news, index) => (
          <SwiperSlide key={index} className={styles.swiperSlide}>
            <Estructura {...news} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div >
  );
};

export default Novedades;
