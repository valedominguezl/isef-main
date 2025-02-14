import React, { useState } from 'react';
import { faqData } from './faqData.jsx';
import styles from './Faq.module.scss';

import faqFlechaInactive from '@/assets/simbols/faqFlechaInactive.webp';
import faqFlechaActive from '@/assets/simbols/faqFlechaInactiveDown.webp';
import searchIcon from "@/assets/simbols/search.webp";
import flecha from "@/assets/simbols/faqFlechaActive.webp";
import flechaHover from "@/assets/simbols/faqFlechaInactiveDown.webp";
import { AnimatePresence, motion } from 'framer-motion';

const Faq = () => {
  // Usamos un objeto para controlar el estado de cada pregunta
  const [active, setActive] = useState({});
  const [searchText, setSearchText] = useState("");
  const [hover, setHover] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [placeholder, setPlaceholder] = useState("Preguntas...");

  const filteredFaqs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
      faq.answer.props.children.toString().toLowerCase().includes(searchText.toLowerCase())
  );

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  // Alterna el estado (abierto/cerrado) de la pregunta en el índice dado
  const toggleFAQ = (index) => {
    setActive(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.faq}>
        <div className={styles.titulo}>
          <h2>Preguntas <span className="color1">frecuentes</span></h2>
        </div>

        <div className={styles.searchCont}>
          <div className={styles.img}>
            <img src={searchIcon} alt="search icon" />
          </div>
          <input
            type="text"
            id="searchFAQ"
            className={styles.txt}
            placeholder={placeholder}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setPlaceholder("")}
            onBlur={() => setPlaceholder("Preguntas...")}
          />
        </div>

        <div className={styles.preguntas}>
          {filteredFaqs.slice(0, visibleCount).map((faq, index) => (
            <div
              key={index}
              className={`${styles.pregunta} ${active[index] ? styles.active : styles.inactive}`}
            >
              <div className={`bl ${styles.toggle}`} onClick={() => toggleFAQ(index)}>
                <h3>{faq.question}</h3>
                <div className={`${styles.flecha} ${active[index] ? styles.active : styles.inactive}`}>
                  <img src={faqFlechaInactive} alt="flecha" />
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
          ))}
        </div>

        {visibleCount < filteredFaqs.length && (
          <div
            className={styles.showMore}
            onClick={handleShowMore}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              backgroundColor: hover ? "var(--principal)" : "white",
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
