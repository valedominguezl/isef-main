import React from 'react'
import styles from './Veinte.module.scss'
import resolucion from '/requisitos/Resolucion 25 años.docx?url';
import material from '/requisitos/Material 25 años.docx?url';
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';

const Veinte = () => {
    return (
        <div className={styles.container}>

            <div className={styles.txtCont}>
                <h2>Para <span>mayores de 25</span> años sin secundario</h2>
                <div className="linea-svg"></div>
                <p>Alumnos sin título secundario y mayores de 25 años también podrán inscribirse en la carrera luego de realizar un <span>examen de conocimientos generales</span>.</p>
            </div>

            <LoadingAnchor href={resolucion} download className="btn-cta download grad4">
                Resolución
            </LoadingAnchor>

            <LoadingAnchor href={material} download className="btn-cta download grad4">
                Material de estudio
            </LoadingAnchor>

        </div>
    )
}

export default Veinte