import React, { useState, useEffect, useRef } from "react";
import styles from "./Cursos.module.scss";
import Curso from "./Curso.jsx";
import Skeleton from "./skeleton/Skeleton";
import Detalle from "./cursosData/Detalle.jsx";
import cursosData from "./cursosData/cursosData.js";
import searchIcon from "@/assets/simbols/search.webp";
import flecha from "@/assets/simbols/faqFlechaActive.webp";
import flechaHover from "@/assets/simbols/faqFlechaInactiveDown.webp";

const Cursos = () => {
  const [searchText, setSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);
  const [hover, setHover] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [placeholder, setPlaceholder] = useState("Buscar cursos...");
  const [isLoading, setIsLoading] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(false);

  // Lógica para la simulación de carga mínima (2 segundos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Lógica para la carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Tiempo de simulación de carga de datos (3 segundos)

    return () => clearTimeout(timer);
  }, []);

  const filteredCursos = cursosData.filter(
    (curso) =>
      curso.title.toLowerCase().includes(searchText.toLowerCase()) ||
      curso.subTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      curso.text.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleShowMore = () => {
    setIsLoading(true);
    setMinLoadingTime(false);

    setTimeout(() => {
      setMinLoadingTime(true);
    }, 1000);

    setTimeout(() => {
      setVisibleCount((prevCount) => prevCount + 4);
      setIsLoading(false);
    }, 1000);
  };

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const titulo = container.querySelector(`.${styles.titulo}`);


    const animatedElements = [titulo].filter(Boolean);

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

    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.titulo} id='especializacionesCursos'>
        <h2 >
          Nuestras últimas <span className="color2">especializaciones</span>
        </h2>
        <div className="linea-svg"></div>
        <p>
          Acá vas a encontrar toda la <strong>información detallada</strong>.
        </p>
      </div>

      <div className={styles.searchCont}>
        <div className={styles.img}>
          <img src={searchIcon} alt="search icon" />
        </div>
        <input
          type="text"
          id="searchCursos"
          className={styles.txt}
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onFocus={() => setPlaceholder("")}
          onBlur={() => setPlaceholder("Buscar cursos...")}
        />
      </div>

      <div className={`${styles.cursos} bl`}>
        {isLoading || !minLoadingTime
          ? [...Array(visibleCount)].map((_, index) => (
            <Skeleton key={index} />
          ))
          : filteredCursos.slice(0, visibleCount).map((curso, index) => (
            <Curso
              key={index}
              {...curso}
              onVerMas={() => setSelectedCurso(curso)}
            />
          ))}
      </div>

      {visibleCount < filteredCursos.length && !isLoading && (
        <div
          className={styles.showMore}
          onClick={handleShowMore}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            backgroundColor: hover ? "var(--principal)" : "white",
          }}
        >
          <img
            src={hover ? flecha : flechaHover}
            alt="Mostrar más"
            className={styles.flecha}
          />
        </div>
      )}

      {selectedCurso && (
        <Detalle curso={selectedCurso} onClose={() => setSelectedCurso(null)} />
      )}
    </div>
  );
};

export default Cursos;
