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
    background: bgImage ? `var(--grad-img), url(${bgImage})` : `var(--grad-fx)`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  return (
    <div style={containerStyle} className={`${styles.container} bl`}>
      <header >
        {showHeading && (
          <h1 className={styles.heading}>
            <span
              dangerouslySetInnerHTML={{ __html: heading || "Default Heading" }}
            />
          </h1>
        )}

        {showLine && <div className="linea-svg bl"></div>}

        {subHeading && <h3 className={styles.subHeading}>{subHeading}</h3>}

        {showButton && <button className={styles.button}>{buttonText}</button>}
      </header>
    </div>
  );
};

export default Intros;
