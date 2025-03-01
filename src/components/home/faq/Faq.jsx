import React, { useState, useEffect, useRef } from 'react';
import { faqData } from './faqData.jsx';
import styles from './Faq.module.scss';
import faqFlecha from '@/assets/simbols/faqFlechaInactive.webp';
import searchIcon from '@/assets/simbols/search.webp';
import flecha from '@/assets/simbols/faqFlechaActive.webp';
import flechaHover from '@/assets/simbols/faqFlechaInactiveDown.webp';
import { AnimatePresence, motion } from 'framer-motion';

const Faq = () => {
  // Estados para controlar preguntas activas, textos y animaciones
  const [active, setActive] = useState({});
  const [searchText, setSearchText] = useState('');
  const normalizeText = (text) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [hover, setHover] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);

  // Nuevos estados para controlar la visibilidad del título y las preguntas
  const [titleVisible, setTitleVisible] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);

  // Implementamos el debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // Función auxiliar para extraer texto de la respuesta
  const getText = (node) => {
    if (typeof node === 'string' || typeof node === 'number') {
      return normalizeText(node.toString());
    }
    if (Array.isArray(node)) {
      return node.map(getText).join(' ');
    }
    if (node && node.props && node.props.children) {
      return getText(node.props.children);
    }
    return '';
  };

  // Filtrar FAQs usando el texto de búsqueda
  const filteredFaqs = faqData.filter((faq) => {
    const search = normalizeText(debouncedSearch.trim()).toLowerCase();
    const questionMatches = normalizeText(faq.question).toLowerCase().includes(search);
    const answerText = getText(faq.answer).toLowerCase();
    const answerMatches = answerText.includes(search);
    return questionMatches || answerMatches;
  });

  // Determinar las FAQs a mostrar
  const faqsToDisplay = debouncedSearch
    ? filteredFaqs
    : filteredFaqs.slice(0, visibleCount);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  // Alterna el estado (abierto/cerrado) de la pregunta en el índice dado
  const toggleFAQ = (index) => {
    setActive((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const questionsRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const titleElement = titleRef.current;
    const questionsElement = questionsRef.current;

    if (!container || !titleElement || !questionsElement) return;

    // Observar el título y el contenedor de preguntas por separado
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.target === titleElement) {
            if (entry.isIntersecting) {
              setTitleVisible(true);
              obs.unobserve(entry.target);
            }
          } else if (entry.target === questionsElement) {
            if (entry.isIntersecting) {
              setQuestionsVisible(true);
              obs.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(titleElement);
    observer.observe(questionsElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.faq}>
        <div
          ref={titleRef}
          className={`${styles.titulo} ${titleVisible ? styles.visible : ''}`}
        >
          <h2>
            Preguntas <span className="color1">frecuentes</span>
          </h2>
        </div>
        <div className={styles.searchCont}>
          <div className={styles.img}>
            <img src={searchIcon} alt="search icon" />
          </div>
          <input
            type="text"
            id="searchFAQ"
            className={styles.txt}
            placeholder={'Buscar en las preguntas...'}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div
          ref={questionsRef}
          className={`${styles.preguntas} ${questionsVisible ? styles.visible : ''}`}
        >
          {faqsToDisplay.length === 0 ? (
            <h3 className={styles.noResultados} style={{ color: 'var(--h4-bcolor)' }}>
              ¡Disculpá!, no se encontraron preguntas sobre eso...
            </h3>
          ) : (
            faqsToDisplay.map((faq, index) => (
              <div
                key={index}
                className={`${styles.pregunta} ${questionsVisible ? styles.visible : ''
                  } ${active[index] ? styles.active : styles.inactive}`}
              >
                <div className={`${styles.toggle}`} onClick={() => toggleFAQ(index)}>
                  <h4>{faq.question}</h4>
                  <div
                    className={`${styles.flecha} ${active[index] ? styles.active : styles.inactive
                      }`}
                  >
                    <img src={faqFlecha} alt="flecha" />
                  </div>
                </div>
                <AnimatePresence>
                  {active[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={styles.respuesta}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
        {!debouncedSearch && visibleCount < filteredFaqs.length && (
          <div
            className={styles.showMore}
            onClick={handleShowMore}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              backgroundColor: hover ? 'var(--principal)' : 'white',
            }}
          >
            <img src={hover ? flecha : flechaHover} alt="Mostrar más" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Faq;
