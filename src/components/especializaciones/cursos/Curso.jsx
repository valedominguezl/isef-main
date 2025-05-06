import React from "react";
import styles from "./Cursos.module.scss";
import TagManager from "react-gtm-module";

const Curso = ({estado, title, subTitle, bgImage, onVerMas }) => {
  const handleClick = () => {
    TagManager.dataLayer({
      dataLayer: {
        event: "curso_ver_mas",
        curso: title,
      },
    });
    onVerMas();
  };

  return (
    <div
      className={styles.curso}
      style={{
        backgroundImage: bgImage ? `var(--grad-img), url(${bgImage})` : "none",
        backgroundPosition: "center",
      }}
    >
      {estado && <div className={styles.cursoEstado}>{estado}</div>}

      <h3>
        <strong>{title}</strong>
      </h3>
      <div className="linea-svg bl"></div>
      <p>{subTitle}</p>
      <button className="btn-cta noHover grad3" onClick={handleClick}>
        Ver más
      </button>
    </div>
  );
};

export default Curso;
