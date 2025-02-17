import React from "react";
import styles from "./Intros.module.scss";

const Intros = ({
  bgImage,
  heading,
  subHeading,
  showHeading = true,
  showButton = true,
  buttonText = "Call to Action",
  showLine = true,
}) => {
  const containerStyle = {
    backgroundImage: bgImage ? `var(--grad-img), url(${bgImage})` : "none",
  };

  return (
    <header style={containerStyle} className={`${styles.container} bl`}>
      {showHeading && (
        <h1 className={styles.heading}>
          <span dangerouslySetInnerHTML={{ __html: heading || "Default Heading" }} />
        </h1>
      )}

      {showLine && <div className="linea-svg bl"></div>}

      {subHeading && (
        <h3 className={styles.subHeading}>
          {subHeading}
        </h3>
      )}

      {showButton && (
        <button className={styles.button}>
          {buttonText}
        </button>
      )}
    </header>
  );
};

export default Intros;