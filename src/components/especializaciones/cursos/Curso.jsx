import React from "react";
import styles from "./Cursos.module.scss";

const Curso = ({ title, subTitle, bgImage, onVerMas }) => {
  return (
    <div
      className={styles.curso}
      style={{
        backgroundImage: bgImage ? `var(--grad-img), url(${bgImage})` : "none",
        backgroundPosition: "center",
      }}
    >
      <h3>
        <span>{title}</span>
      </h3>
      <div className="linea-svg bl"></div>
      <p>{subTitle}</p>
      <button className="btn-cta noHover grad3" onClick={onVerMas}>
        Ver más
      </button>
    </div>
  );
};

export default Curso;
