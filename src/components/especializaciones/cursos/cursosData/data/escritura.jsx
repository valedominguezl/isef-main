import getCourseImage from '../getCourseImage'

const escritura = {
    title: "Taller de Escritura Científica",
    subTitle: "Apoyo en la realización de la primera investigación",
    bgImage: getCourseImage("escritura.webp"),
    expositor: 1,
    descripcion: <p>
        Nos centraremos en guiar a los participantes a través del <strong>proceso de escritura científica</strong>, proporcionando el apoyo necesario para realizar su <strong>primera investigación</strong>. Los temas incluyen la redacción de la sección de material y métodos, selección de población y muestra, identificación de variables e indicadores clave, y la aplicación de principios bioéticos.
        <br /><br />
        También se explorarán <strong>técnicas estadísticas</strong> para la presentación de resultados y se brindarán herramientas para la discusión y la elaboración de conclusiones, asegurando así una comunicación clara y efectiva de los hallazgos científicos. <strong>Este curso está diseñado para apoyar a los investigadores noveles en la publicación de sus primeros trabajos</strong>.
    </p>
    ,
    duracion: null,
    modalidad: null,
    costo: null,
    inicio: null,
    importante: null,
    condiciones: null,
    temario: [
        {
            tema: "Temario general",
            subtemas: [
                { tema: "Material y métodos." },
                { tema: "Población y muestra." },
                { tema: "Variables e indicadores." },
                { tema: "Bioética" },
                { tema: "Estadística. Resultados." },
                { tema: "Discusión y conclusiones" },
            ],
        },
    ],
};

export default escritura;
