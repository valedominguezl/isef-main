// Detalle.jsx (fragmento)
import React, { useEffect } from "react";
import styles from "./Detalle.module.scss";
import Temario from "./Temario";

const Detalle = ({ curso, onClose }) => {
    useEffect(() => {
        // Bloquea el scroll cuando el modal está abierto
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            // Restaura el scroll cuando el modal se cierra
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "auto";
        };
    }, []);

    const handleOutsideClick = (e) => {
        if (e.target.classList.contains(styles.container)) {
            onClose();
        }
    };

    const getModalidadText = (modalidad) => {
        if (modalidad === 1) return "Online";
        if (modalidad === 2) return "Presencial";
        return modalidad || "Modalidad no especificada";
    };

    const getExpositorText = (expositor) => {
        if (expositor === 1) return "Dr. Nelio Bazán";
        if (expositor === 2) return "Lic. Jorge Roig";
        if (expositor === 3) return "Dr. Roberto Rosler";
        return expositor || "Modalidad no especificada";
    };

    return (
        <div className={`${styles.container}`} onClick={handleOutsideClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>


                <div className={`${styles.titulo} bl`}
                    style={{
                        backgroundImage: curso.bgImage ? `var(--grad-img), url(${curso.bgImage})` : "none",
                        backgroundPosition: "center",
                    }}>
                    <div className={styles.botonCont}>
                        <h2><span>{curso.title}</span></h2>
                        <button className={styles.close} onClick={onClose} aria-label="Cerrar">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="30px"
                                viewBox="0 -960 960 960"
                                width="30px"
                                fill="#ffffff"
                            >
                                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                            </svg>
                        </button>
                    </div>
                    <h3>{curso.subTitle}</h3>
                    <div className={`${styles.btn} btn-cta grad3`}>
                        <a href='https://wa.me/2664564435' target="_blank">Consultar información</a>
                    </div>
                </div>

                {curso.expositor && (
                    <div className={styles.dato}>
                        <strong>Expositor:</strong>
                        <p>{getExpositorText(curso.expositor)}</p>
                    </div>
                )}
                {curso.descripcion && (
                    <div className={styles.dato}>
                        <strong>Descripción:</strong>
                        <div>{curso.descripcion}</div>
                    </div>
                )}


                {curso.duracion && (
                    <div className={styles.dato}>
                        <strong>Duración:</strong>
                        <p>{curso.duracion}</p>
                    </div>
                )}
                {curso.modalidad && (
                    <div className={styles.dato}>
                        <strong>Modalidad:</strong>
                        <p>{getModalidadText(curso.modalidad)}</p>
                    </div>
                )}
                {curso.costo && (
                    <div className={styles.dato}>
                        <strong>Costo:</strong>
                        <p>{curso.costo}</p>
                    </div>
                )}
                {curso.inicio && (
                    <div className={styles.dato}>
                        <strong>Inicio:</strong>
                        <p>{curso.inicio}</p>
                    </div>
                )}
                {curso.importante && (
                    <div className={styles.dato}>
                        <strong>Importante:</strong>
                        <p>{curso.importante}</p>
                    </div>
                )}
                {curso.condiciones && (
                    <div className={styles.dato}>
                        <strong>Condiciones:</strong>
                        <p>{curso.condiciones}</p>
                    </div>
                )}



                {curso.temario && (
                    <>
                        <Temario temario={curso.temario} />
                    </>
                )}
            </div>
        </div>
    );
};

export default Detalle;
