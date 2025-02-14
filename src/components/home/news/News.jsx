// src/components/News.jsx
import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import igLinks from './igLinks';
import styles from './News.module.scss';
import scroll from '@/assets/simbols/faqFlechaActive.webp';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const News = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.instgrm && window.instgrm.Embeds) {
                window.instgrm.Embeds.process();
            }

            const containers = document.querySelectorAll(`.${styles.embedContainer}`);
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
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <Swiper
            className={styles.container}
            modules={[Navigation, Pagination]}
            centeredSlides={true}
            navigation={{ enabled: true }}
            pagination={{ clickable: true }}
            breakpoints={{
                0: {
                    slidesPerView: 1,
                    spaceBetween: 100,
                    loop: false,
                    navigation: { enabled: true },
                },
                550: {
                    slidesPerView: 1,
                    spaceBetween: 100,
                    loop: true,
                    navigation: { enabled: true },
                },
                750: {
                    slidesPerView: 2,
                    spaceBetween: 10,
                    loop: true,
                    navigation: { enabled: true },
                },
                900: {
                    slidesPerView: 2,
                    spaceBetween: 120,
                    loop: true,
                    navigation: { enabled: true },
                },
                1400: {
                    slidesPerView: 3,
                    spaceBetween: 120,
                    loop: true,
                    navigation: { enabled: true },
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
    );
};

export default News;
