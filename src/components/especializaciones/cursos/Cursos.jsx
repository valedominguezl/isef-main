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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);
  const [hover, setHover] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [placeholder, setPlaceholder] = useState("Buscar cursos...");
  const [isLoading, setIsLoading] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(false);
  const [showCursos, setShowCursos] = useState(false);

  // Refs
  const containerRef = useRef(null);
  const cursosRef = useRef(null);
  const cursosSentinelRef = useRef(null);

  // Debounce para la búsqueda (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Helper para extraer texto de elementos (similar a Faq.jsx)
  const getText = (node) => {
    if (typeof node === "string" || typeof node === "number") {
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(getText).join(" ");
    }
    if (node && node.props && node.props.children) {
      return getText(node.props.children);
    }
    return "";
  };

  // Función para obtener el nombre del expositor
  const getExpositorText = (expositor) => {
    if (expositor === 1) return "Dr. Nelio Bazán";
    if (expositor === 2) return "Lic. Jorge Roig";
    if (expositor === 3) return "Dr. Roberto Rosler";
    return "";
  };

  // Función para concatenar TODO el contenido textual del curso:
  // título, subtítulo, descripción, datos y temario (incluyendo subtemas)
  const getCourseSearchText = (curso) => {
    let text = "";
    if (curso.title) text += " " + curso.title;
    if (curso.subTitle) text += " " + curso.subTitle;
    if (curso.descripcion) text += " " + getText(curso.descripcion);
    if (curso.text) text += " " + curso.text;
    if (curso.expositor) text += " " + getExpositorText(curso.expositor);
    if (curso.duracion) text += " " + curso.duracion;
    if (curso.modalidad) text += " " + curso.modalidad;
    if (curso.costo) text += " " + curso.costo;
    if (curso.inicio) text += " " + curso.inicio;
    if (curso.importante) text += " " + curso.importante;
    if (curso.condiciones) text += " " + curso.condiciones;
    if (curso.temario && Array.isArray(curso.temario)) {
      curso.temario.forEach((topic) => {
        if (topic.tema) text += " " + topic.tema;
        if (topic.subtemas && Array.isArray(topic.subtemas)) {
          topic.subtemas.forEach((sub) => {
            if (sub.tema) text += " " + sub.tema;
          });
        }
      });
    }
    return text;
  };

  // Filtrar cursos usando debouncedSearch sobre TODO el texto del curso
  const filteredCursos = cursosData.filter((curso) => {
    const aggregatedText = getCourseSearchText(curso).toLowerCase();
    const search = debouncedSearch.trim().toLowerCase();
    return aggregatedText.includes(search);
  });

  // Si hay búsqueda se muestran todos; si no, se limita a visibleCount
  const cursosToDisplay = debouncedSearch ? filteredCursos : filteredCursos.slice(0, visibleCount);

  // Manejador para el botón "Mostrar más"
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

  // Simulación de carga mínima (2 segundos)
  useEffect(() => {
    if (showCursos) {
      setMinLoadingTime(false);
      const timer = setTimeout(() => {
        setMinLoadingTime(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showCursos]);

  // Simulación de carga de datos (3 segundos)
  useEffect(() => {
    if (showCursos) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showCursos]);

  // Observer para animar el título
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const titulo = container.querySelector(`.${styles.titulo}`);
    if (!titulo) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            titulo.classList.add(styles.visible);
            obs.unobserve(titulo);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(titulo);
    return () => observer.disconnect();
  }, []);

  // Observer para el sentinela de cursos
  useEffect(() => {
    if (!cursosSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowCursos(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(cursosSentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Observer para animar el contenedor de cursos
  useEffect(() => {
    if (showCursos && cursosRef.current) {
      const cursosEl = cursosRef.current;
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              cursosEl.classList.add(styles.visible);
              obs.unobserve(cursosEl);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(cursosEl);
      return () => observer.disconnect();
    }
  }, [showCursos]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.titulo} id="especializacionesCursos">
        <h2>
          Nuestras últimas <span className="color1">especializaciones</span>
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

      {/* Sentinela: elemento invisible para detectar cuándo renderizar los cursos */}
      <div ref={cursosSentinelRef} style={{ height: "1px" }}></div>

      {/* Se renderiza el contenedor de cursos solo cuando showCursos es true */}
      {showCursos && (
        <div ref={cursosRef} className={`${styles.cursos} bl`}>
          {isLoading || !minLoadingTime ? (
            [...Array(visibleCount)].map((_, index) => <Skeleton key={index} />)
          ) : cursosToDisplay.length > 0 ? (
            cursosToDisplay.map((curso, index) => (
              <Curso
                key={index}
                {...curso}
                onVerMas={() => setSelectedCurso(curso)}
              />
            ))
          ) : (
            <h3 style={{ color: 'var(--h4-bcolor)' }}>
              ¡Disculpá!, no se encontraron cursos sobre eso...
            </h3>
          )}
        </div>
      )}


      {/* Mostrar más solo si no hay búsqueda activa */}
      {!debouncedSearch && visibleCount < filteredCursos.length && !isLoading && (
        <div
          className={styles.showMore}
          onClick={handleShowMore}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            backgroundColor: hover ? "var(--principal)" : "white",
          }}
        >
          <img src={hover ? flecha : flechaHover} alt="Mostrar más" className={styles.flecha} />
        </div>
      )}

      {selectedCurso && (
        <Detalle curso={selectedCurso} onClose={() => setSelectedCurso(null)} />
      )}
    </div>
  );
};

export default Cursos;
