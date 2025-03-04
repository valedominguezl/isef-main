import React from 'react'
import styles from './Intro.module.scss'
import ScrollToSection from '@/components/funciones/scroll/ScrollToSection';
import LoadingAnchor from '@/components/funciones/loadingBar/LoadingAnchor';


const Intro = () => {
    return (
        <div className={styles.container}>
            <div className={styles.titulo}>
                <h2>El <span className="color1">I.S.E.F. San Luís</span></h2>
                <div className="linea-svg"></div>
                <p>
                    El <strong>Instituto Superior de Educación Física (I.S.E.F.) San Luis</strong> es inscrito en el ministerio de educación de San Luis el <strong>30 de junio de 1999</strong>. Es el <strong>primer profesorado de educación física de la provincia</strong> y su orientación abordaba temáticas como la salud, calidad de vida y actividades en la naturaleza. Habiendo obtenido la <strong>validez nacional de sus títulos</strong>, comenzó a trabajar en el fortalecimiento de la formación inicial con políticas innovadoras como las de duplicar la carga horaria de todo el trayecto de la practica docente desde primero hasta cuarto año. Para ello contrató dos catedráticos con perfiles complementarios como lo son el profesor de educación física y el licenciado en ciencias de la educación. A este trayecto se le incorporó una asesoría pedagógica para integrar y complementar las tareas de articulación de todo el trayecto.
                    <br /> <br />

                    En la actualidad el profesorado funciona en el <strong>club sociedad española</strong>, integrando las actividades deportivas y las académicas en el mismo lugar. Este club cuenta con excelentes instalaciones permitiéndonos desarrollar talleres complementarios dictados por <strong>científicos de renombre mundial</strong> en áreas como las neurociencias, nutrición deportiva, actividades de gimnasio, entrenamiento de la fuerza, y muchas otras más.
                    <br /> <br />
                    Pensando en el futuro de sus alumnos, la institución cuenta con un novedoso <strong>laboratorio de investigación</strong> en anatomía funcional, fisiología del ejercicio y nutrición, a cargo del doctor Nelio Bazán. Este laboratorio cuenta con <strong>equipamiento profesional</strong> y permite a los alumnos realizar prácticas de investigación en el campo de la educación física y la salud.
                </p>
            </div>

            {/* <ScrollToSection page="/Home" id="novedades" className="btn-cta grad">
                Laboratorio
            </ScrollToSection> */}

        </div>
    )
}

export default Intro