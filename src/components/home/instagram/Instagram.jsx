// src/components/News.jsx
import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import igLinks from './igLinks';
import styles from './Instagram.module.scss';
import scroll from '@/assets/simbols/faqFlechaActive.webp';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Instagram = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            // Esperamos un poco antes de procesar los embeds
            setTimeout(() => {
                if (window.instgrm?.Embeds) {
                    window.instgrm.Embeds.process();
                }
            }, 500);

            // Eliminamos el overlay cuando se haga scroll o toque en el contenedor
            const containers = document.querySelectorAll(`.${styles.embedContainer}`);
            const removeOverlays = () => {
                const scrollOverlays = document.querySelectorAll(`.${styles.scroll}`);
                scrollOverlays.forEach(overlay => {
                    overlay.style.display = 'none';
                });
            };

            containers.forEach(container => {
                container.addEventListener('scroll', removeOverlays);
                container.addEventListener('touchstart', removeOverlays);
                container.addEventListener('mousedown', removeOverlays);
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);


    return (
        <div className={styles.container}>
            <div className={styles.titulo}>
                <h2>Últimas <span className="color1">publicaciones</span></h2>
                <div className="linea-svg"></div>
                <p>E</p>
            </div>

            <Swiper
                className={styles.swiper}
                modules={[Navigation, Pagination]}
                centeredSlides={true}
                navigation={{ enabled: true }}
                pagination={{ enabled: true, clickable: true }}
                breakpoints={{
                    0: {
                        slidesPerView: 1,
                        spaceBetween: 100,
                        loop: false,
                        navigation: { enabled: true },
                        pagination: { enabled: true },
                    },
                    550: {
                        slidesPerView: 1,
                        spaceBetween: 100,
                        loop: true,
                        navigation: { enabled: true },
                        pagination: { enabled: true },
                    },
                    750: {
                        slidesPerView: 2,
                        spaceBetween: 10,
                        loop: true,
                        navigation: { enabled: true },
                        pagination: { enabled: true },
                    },
                    900: {
                        slidesPerView: 2,
                        spaceBetween: 120,
                        loop: true,
                        navigation: { enabled: true },
                        pagination: { enabled: false },
                    },
                    1400: {
                        slidesPerView: 3,
                        spaceBetween: 120,
                        loop: true,
                        navigation: { enabled: true },
                        pagination: { enabled: false },
                    },
                }}
            >


                {igLinks.map((blockquote, index) => (
                    <SwiperSlide key={index} className={styles.slide}>
                        <div className={styles.embedContainer}>
                            <div dangerouslySetInnerHTML={{ __html: blockquote }} />
                            <div className={`${styles.scroll} bl`}>
                                <p>Deslizá para ver más</p>
                                <img src={scroll} alt="Scroll down" />
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Instagram;
