import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Especializaciones.module.scss";
import Curso from "@/components/especializaciones/cursos/Curso.jsx";
import cursosData from "@/components/especializaciones/cursos/cursosData/cursosData.js";

const Especializaciones = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Nombres de los componentes de los cursos que deseas mostrar en el orden deseado
  const selectedCourseNames = [
    "nutricion",
    "antropometria",
    "escritura",
    "investigacion",
    "intermitente",
    "neurociencias",
  ];

  // Crear un objeto para acceso rápido a los cursos por nombre
  const cursosDataByName = cursosData.reduce((acc, curso) => {
    acc[curso.name] = curso;
    return acc;
  }, {});

  // Obtener los cursos en el orden especificado
  const selectedEspecializaciones = selectedCourseNames.map((name) => cursosDataByName[name]).filter(Boolean);

  // Determina cuántos cursos mostrar por slide según el ancho de la ventana
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

  // Función para manejar 'Ver Más'
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
      }, 1000); // Duración de la animación

    }, 8000); // Intervalo entre slides

    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

  return (
    <div id="especializacionesCarrera" className={styles.container}>
      <div className={`${styles.sliderContainer}`}>
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
      {/* Paginación */}
      {slides.length > 0 && (
        <div className={styles.pagination}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`${styles.bullet} ${currentSlide === index ? styles.activeBullet : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Especializaciones;
