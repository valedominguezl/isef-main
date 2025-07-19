import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Especializaciones.module.scss";
import Curso from "@/components/especializaciones/cursos/Curso.jsx";
import cursosData from "@/components/especializaciones/cursos/cursosData/cursosData.js";

const Especializaciones = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sliderRef = useRef(null);
  const touchStartX = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [nextSlide, setNextSlide] = useState(null);
  const [itemsPerSlide, setItemsPerSlide] = useState(() => window.innerWidth > 1300 ? 2 : 1);
  const inactivityTimer = useRef(null);
  const autoSlideTimer = useRef(null);

  const selectedCourseNames = [
    "intArtificial",
    "nutricion",
    "antropometria",
    "investigacion",
    "intermitente",
    "neurociencias",
  ];

  const cursosDataByName = cursosData.reduce((acc, curso) => {
    acc[curso.name] = curso;
    return acc;
  }, {});

  const selectedEspecializaciones = selectedCourseNames.map((name) => cursosDataByName[name]).filter(Boolean);

  const buildSlides = () => {
    const result = [];
    for (let i = 0; i < selectedEspecializaciones.length; i += itemsPerSlide) {
      result.push(selectedEspecializaciones.slice(i, i + itemsPerSlide));
    }
    return result;
  };

  const [slides, setSlides] = useState(buildSlides);

  useEffect(() => {
    const handleResize = () => {
      const newItems = window.innerWidth > 1300 ? 2 : 1;
      setItemsPerSlide(newItems);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSlides(buildSlides());
    setCurrentSlide(0);
  }, [itemsPerSlide]);

  const handleVerMas = () => {
    const targetPage = "/Especializaciones";
    const targetId = "especializacionesCursos";
    navigate(targetPage);
    const checkExist = setInterval(() => {
      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
        clearInterval(checkExist);
      }
    }, 300);
    setTimeout(() => clearInterval(checkExist), 5000);
  };

  const startAutoSlide = () => {
    clearInterval(autoSlideTimer.current);
    autoSlideTimer.current = setInterval(() => {
      const newNext = (currentSlide + 1) % slides.length;
      setNextSlide(newNext);
      setAnimating(true);
      setTimeout(() => {
        setCurrentSlide(newNext);
        setNextSlide(null);
        setAnimating(false);
      }, 1000);
    }, 8000);
  };

  const pauseAutoSlide = () => {
    clearInterval(autoSlideTimer.current);
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      startAutoSlide();
    }, 5000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      clearInterval(autoSlideTimer.current);
      clearTimeout(inactivityTimer.current);
    };
  }, [currentSlide, slides.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    pauseAutoSlide();
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - touchStartX.current;
    if (Math.abs(deltaX) > 50 && !animating) {
      const direction = deltaX > 0 ? -1 : 1;
      const newIndex = (currentSlide + direction + slides.length) % slides.length;
      setNextSlide(newIndex);
      setAnimating(true);
      setTimeout(() => {
        setCurrentSlide(newIndex);
        setNextSlide(null);
        setAnimating(false);
      }, 1000);
    }
  };

  return (
    <div
      id="especializacionesCarrera"
      className={styles.container}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      ref={sliderRef}
    >
      <div className={styles.sliderContainer}>
        {slides.length > 0 && (
          <>
            {!animating && (
              <div className={styles.slide}>
                {slides[currentSlide].map((curso, idx) => (
                  <Curso key={idx} {...curso} onVerMas={handleVerMas} />
                ))}
              </div>
            )}
            {animating && nextSlide !== null && (
              <>
                <div className={`${styles.slide} ${styles.slideExit}`}>
                  {slides[currentSlide].map((curso, idx) => (
                    <Curso key={idx} {...curso} onVerMas={handleVerMas} />
                  ))}
                </div>
                <div className={`${styles.slide} ${styles.slideEnter}`}>
                  {slides[nextSlide].map((curso, idx) => (
                    <Curso key={idx} {...curso} onVerMas={handleVerMas} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {slides.length > 0 && (
        <div className={styles.pagination}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`${styles.bullet} ${currentSlide === index ? styles.activeBullet : ""}`}
              onClick={() => {
                pauseAutoSlide();
                setCurrentSlide(index);
              }}
            ></span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Especializaciones;