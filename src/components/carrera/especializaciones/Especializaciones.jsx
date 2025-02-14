import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Especializaciones.module.scss";
import Curso from "@/components/especializaciones/cursos/Curso.jsx";
import cursosData from "@/components/especializaciones/cursos/cursosData/cursosData.js";

const Especializaciones = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Selección manual de cursos a mostrar
const selectedEspecializaciones = cursosData.slice(0, 6);

  // Determina cuántos cursos mostrar según el ancho de la ventana
  const getItemsPerSlide = () => (window.innerWidth > 1300 ? 2 : 1);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Divide los cursos en slides según itemsPerSlide
  const slides = [];
  for (let i = 0; i < selectedEspecializaciones.length; i += itemsPerSlide) {
    slides.push(selectedEspecializaciones.slice(i, i + itemsPerSlide));
  }

  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    setCurrentSlide(0);
  }, [itemsPerSlide]);

  // Estados para controlar la animación del slider
  const [nextSlide, setNextSlide] = useState(null);
  const [animating, setAnimating] = useState(false);

  // Función que imita el comportamiento de ScrollToSection:
  // Navega a la ruta targetPage y, tras comprobar que se cargó la sección, hace scroll al elemento con id targetId.
  const handleVerMas = () => {
    const targetPage = "/Especializaciones"; // Cambia esta ruta según necesites
    const targetId = "especializacionesCursos"; // Cambia el id de destino si hace falta

    navigate(targetPage);

    // Inicia un intervalo para comprobar si ya se cargó la sección.
    const checkExist = setInterval(() => {
      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
        clearInterval(checkExist);
      }
    }, 300);

    // Como medida de seguridad, se limpia el intervalo después de 5 segundos.
    setTimeout(() => {
      clearInterval(checkExist);
    }, 5000);
  };

  // Lógica para la animación automática del slider
  useEffect(() => {
    const interval = setInterval(() => {
      const newNext = (currentSlide + 1) % slides.length;
      setNextSlide(newNext);
      setAnimating(true);

      setTimeout(() => {
        setCurrentSlide(newNext);
        setNextSlide(null);
        setAnimating(false);
      }, 1000); // Duración de la animación (debe coincidir con el SCSS)
    }, 5000); // Intervalo entre slides

    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

return (
    <div className={styles.container}>
        <div className={`${styles.sliderContainer} bl`}>
            {/* Renderizado del slide actual sin animación */}
            {!animating && (
                <div className={styles.slide}>
                    {slides[currentSlide].map((curso, idx) => (
                        <Curso key={idx} {...curso} onVerMas={handleVerMas} />
                    ))}
                </div>
            )}
            {/* Renderizado durante la animación: se muestran dos slides */}
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
        </div>
        {/* Pagination Bullets */}
        <div className={styles.pagination}>
            {slides.map((_, index) => (
                <span
                    key={index}
                    className={`${styles.bullet} ${currentSlide === index ? styles.activeBullet : ""}`}
                    onClick={() => setCurrentSlide(index)}
                ></span>
            ))}
        </div>
    </div>
);
};

export default Especializaciones;
