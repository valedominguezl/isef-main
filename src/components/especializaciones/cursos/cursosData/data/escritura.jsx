import getCourseImage from '../getCourseImage'

const escritura = {
    name: "escritura",
    title: "Taller de escritura científica",
    subTitle: "Apoyo en la realización de la primera investigación",
    bgImage: getCourseImage("escritura.webp"),
    expositor: 1,
    descripcion: <p>
        Este Taller de Escritura Científica <strong>(TEC)</strong> tiene como principal tarea la de apoyar al estudiante y profesional en la <strong>realización concreta de su primera investigación</strong>. Se brindan las bases teóricas y fundamentalmente su operacionalización para que desarrolle un trabajo de investigación simple, sencillo, de nivel observacional o correlacional, pero con correctas bases metodológicas. <br /> <br />
        Se brindan los elementos para que el cursante pueda realizar un trabajo científico de investigación original, preferentemente de características territoriales, es decir ligado a su propio entorno de trabajo, dentro de las líneas de investigación que promueve la institución, y con un <strong>nivel apto para ser publicado en una revista</strong> con revisión por pares. <strong>Este curso está diseñado para apoyar a los investigadores noveles en la publicación de sus primeros trabajos.</strong>
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
