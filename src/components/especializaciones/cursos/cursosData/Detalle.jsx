import React, { useEffect, useState } from "react";
import styles from "./Detalle.module.scss";
import Temario from "./Temario";
import closeIcon from '@/assets/simbols/close.webp';

const Detalle = ({ curso, onClose }) => {
    // Estado para controlar la pestaña activa: "detalles" o "temario"
    const [activeTab, setActiveTab] = useState("detalles");

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
        <div className={styles.container} onClick={handleOutsideClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={`${styles.titulo} bl`}
                    style={{
                        backgroundImage: curso.bgImage ? `var(--grad-img), url(${curso.bgImage})` : "none",
                        backgroundPosition: "center",
                    }}>
                    <div className={styles.botonCont}>
                        <h2><strong>{curso.title}</strong></h2>
                        <button className={styles.close} aria-label="Cerrar">
                            <img onClick={onClose} src={closeIcon} alt="Cerrar" />
                        </button>
                    </div>
                    <div className="linea-svg bl"></div>
                    <h3>{curso.subTitle}</h3>
                    <div className={`${styles.btn} btn-cta grad3`}>
                        <a href="https://wa.me/2664564435" target="_blank" rel="noopener noreferrer">
                            Consultar cupos
                        </a>
                    </div>
                </div>

                {/* Selector de pestañas */}
                <div className={styles.selector}>
                    <div
                        className={`${styles.seccion} ${activeTab === "detalles" ? styles.active : ""}`}
                        onClick={() => setActiveTab("detalles")}
                    >
                        <h4>Detalles</h4>
                    </div>

                    <div
                        className={`${styles.seccion} ${activeTab === "temario" ? styles.active : ""}`}
                        onClick={() => setActiveTab("temario")}
                    >
                        <h4>Temario</h4>
                    </div>
                </div>

                {/* Renderizado condicional según la pestaña activa */}
                {activeTab === "detalles" && (
                    <div className={styles.datos}>
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
                    </div>
                )}

                {activeTab === "temario" && curso.temario && (
                    <Temario temario={curso.temario} />
                )}
            </div>
        </div>
    );
};

export default Detalle;
