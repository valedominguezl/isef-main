import React from 'react'
import styles from './Secundario.module.scss'

const Secundario = () => {
    return (
        <div className={`${styles.container} bl`}>
            <div className={styles.txtCont}>
                <h2>
                    ¿Recién te egresás del <span>secundario</span>?
                </h2>
                <div className="linea-svg bl"></div>
                <p>
                    No te preocupes, tenés hasta el <span>30 de Julio</span> para sacar todas las materias que adeudes.
                    <span>
                        <br />
                        Después de esta fecha, ya no podrás seguir cursando
                    </span>
                </p>
            </div>

            <div className={styles.calendar}>
                <div className={styles.calendar__month}>Julio</div>
                <div className={styles.calendar__day}>30</div>
            </div>
        </div>
    )
}

export default Secundario
