import React, { useState, useEffect, useRef } from "react";
import styles from "./Plan.module.scss";
import { motion, AnimatePresence } from "framer-motion";
import faqFlechaInactive from '@/assets/simbols/faqFlechaInactive.webp';

const data = [
  {
    tema: "1° año",
    carga: "752 horas reloj | 1.128 horas cátedra",
    subtemas: [
      "Anatomía funcional (Materia, 80hs)",
      "Gimnasia (Materia, 80hs)",
      "Prácticas acuáticas y su didáctica (Materia, 80hs)",
      "Didáctica general (Materia, 48hs)",
      "Alfabetización académica (Taller, 32 hs)",
      "Alfabetización digital (Taller, 32hs)",
      "Sociología de la educación (Taller, 48hs)",
      "Prácticas ludomotrices y recreativas (Taller, 64hs)",
      "Expresión y comunicación motriz (Taller, 64hs)",
      "Introducción a las prácticas deportivas (Materia, 80hs)",
      "Práctica docente I (Practica docente, 80hs)",
      "Pedagogía (Materia, 64hs)",
    ],
  },
  {
    tema: "2° año",
    carga: "848 horas reloj | 1.272 horas cátedra",
    subtemas: [
      "Psicología educacional (Materia, 80hs)",
      "Voley y su didáctica (Materia, 80hs)",
      "Atletismo y su didáctica (Materia, 80hs)",
      "Desarrollo y aprendizaje motor (Materia, 80hs)",
      "Fisiología humana y de la motricidad (Materia, 80hs)",
      "Didática de la educación física del nivel inicial y primario (Materia, 80hs)",
      "Historia y política de la educación argentina (Materia, 48hs)",
      "Sujeto de la educación física I (Materia, 32hs)",
      "Sujeto de la educación física II (Materia, 32hs)",
      "Filosofía de la educación (Materia, 48hs)",
      "Formación ética y deontología (Materia, 64hs)",
      "Epistemología de la educación física (Taller, 48hs)",
      "Práctica docente II (Práctica docente, 96hs)",
    ],
  },
  {
    tema: "3° año",
    carga: "672 horas reloj | 1.008 horas cátedra",
    subtemas: [
      "Handbol y su didáctica (Materia, 80hs)",
      "Fútbol y su didáctica (Materia, 80hs)",
      "Básquet y su didáctica (Materia, 80hs)",
      "Didáctica de la educación física del nivel secundario (Materia, 48hs)",
      "Didáctica de la educación física para la atención de necesidades educativas especiales (Materia, 48hs)",
      "Inglés técnico (Materia, 48hs)",
      "Educación sexual integral (Taller, 48hs)",
      "Lengua de señas argentina (Taller, 32hs)",
      "Expresiones culturales de la identidad provincial (Taller, 64hs)",
      "Educación física para la social recreación (Taller, 32hs)",
      "Práctica de la enseñanza (Práctica docente, 112hs)",
      "Práctica nivel inicial",
      "Práctica nivel primario",
    ],
  },
  {
    tema: "4° año",
    carga: "704 horas reloj | 1.056 horas cátedra",
    subtemas: [
      "Metodología de la investigación (Materia, 64hs)",
      "Enternamiento y evaluaciones deportivas (Materia, 64hs)",
      "Hockey y su didáctica (Materia, 80hs)",
      "Actividad física en medios naturales (Materia, 64hs)",
      "Softbol y su didáctica (Materia, 48hs)",
      "Rugby y su didáctica (Materia, 48hs)",
      "Actividades físicas para la salud (Taller, 48hs)",
      "Administración y gestión en el ámbito de la educación física (Taller, 48hs)",
      "Residencia pedagógica (Práctica docente, 240hs)",
      "Práctica nivel secundario",
      "Práctica ámbito no formal",
    ],
  },
];

// Obtener el ancho de la ventana
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

const Plan = () => {
  const width = useWindowWidth();
  const isMobile = width < 1024;

  // Inicializamos todos los temas como cerrados (false)
  const [openTemas, setOpenTemas] = useState(data.map(() => false));

  // Si el ancho cambia (por ejemplo, al redimensionar), reiniciamos el estado
  useEffect(() => {
    setOpenTemas(data.map(() => false)); // Todos cerrados
  }, [isMobile]);

  const toggleTema = (index) => {
    setOpenTemas((prev) => {
      const newState = [...prev];

      // Si estamos en pantallas grandes, agrupamos en pares
      if (!isMobile) {
        if (index % 2 === 0) {
          newState[index] = !newState[index];
          if (index + 1 < newState.length) {
            newState[index + 1] = newState[index]; // Cambiar el segundo tema también
          }
        } else {
          // Si el índice es impar (1, 3, 5...), toggle el primer tema del par
          newState[index - 1] = !newState[index - 1];
          newState[index] = newState[index - 1]; // Cambiar el segundo tema también
        }
      } else {
        // Si estamos en pantallas pequeñas, solo toggle el tema actual
        newState[index] = !newState[index];
      }

      return newState;
    });
  };

  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Seleccion elementos a animar:
    const titulo = container.querySelector(`.${styles.titulo}`);
    const topicChildren = container.querySelectorAll(`.${styles.topic}`);

    // Array
    const animatedElements = [titulo, ...topicChildren].filter(Boolean);

    // IntersectionObserver
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

    // Cleanup
    return () => {
      animatedElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.titulo}>
        <h2>
          Plan de <span className="color1">estudios</span>
        </h2>
        <div className="linea-svg"></div>
        <p>
          La carrera tiene una <strong>duración estimada de 4 años</strong> expresados en:
          <strong> 2.976 horas reloj</strong> o <strong>4.446 horas cátedra</strong>.
        </p>
      </div>

      <div className={styles.plan}>
        {data.map((item, index) => (
          <div key={index} className={styles.topic}>
            <div
              className={`bl ${styles.toggle} ${openTemas[index] ? styles.active : ''}`}
              onClick={() => toggleTema(index)} // Toggle el tema correspondiente
            >
              <div className={styles.text}>
                <h4>{item.tema}</h4>
                <img
                  src={faqFlechaInactive}
                  alt="flecha"
                  className={`${styles.flecha} ${openTemas[index] ? styles.active : ''}`}
                />
              </div>

              <h3>
                {item.carga
                  .split('|')
                  .map((line, idx, array) => (
                    <React.Fragment key={idx}>
                      {line.trim()}
                      {idx < array.length - 1 ? ',' : ''}
                      <br />
                    </React.Fragment>
                  ))}
              </h3>
            </div>

            <AnimatePresence>
              {openTemas[index] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={styles.subTopics}
                >
                  {item.subtemas.map((subtema, subIndex) => (
                    <div key={subIndex} className={styles.subTopic}>
                      <p>
                        <strong>
                          {subIndex + 1}. {subtema.split('(')[0].trim()}
                        </strong>
                      </p>
                      {subtema.includes('(') && <p>({subtema.split('(')[1]}</p>}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plan;
