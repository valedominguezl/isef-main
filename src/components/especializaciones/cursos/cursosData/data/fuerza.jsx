import getCourseImage from '../getCourseImage'

const fuerza = {
  name: "fuerza",
  title: "Entrenamiento de la fuerza",
  subTitle: "Las aplicaciones en el gimnasio y su suplementación",
  bgImage: getCourseImage("fuerza.webp"),
  expositor: 2,
  descripcion: <p>
    Verás técnicas y metodologías avanzadas del entrenamiento de la fuerza, con un enfoque en su <strong>aplicación práctica en el gimnasio</strong>. Se abordarán temas como la anamnesis inicial del practicante, la composición corporal, y las adaptaciones al entrenamiento de la fuerza. También se explorará la determinación de la <strong>fuerza máxima (1RM)</strong>, la entrada en calor, la progresión de las cargas, y los tiempos metabólicos del ejercicio.
    <br /><br />
    En la sección de <strong>suplementación</strong>, se discutirán los diferentes <strong>tipos de suplementos y su uso según los objetivos del entrenamiento</strong>, así como la planificación de la dosificación de estos suplementos para optimizar la recuperación y el rendimiento muscular. <strong>Este curso es ideal para entrenadores, fisioterapeutas y entusiastas del fitness que buscan una comprensión detallada y práctica del entrenamiento de la fuerza y su suplementación</strong>.
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
      tema: "Entrenamiento de la fuerza",
      subtemas: [
        { tema: "La anamnesis del primer día de quien entrenará musculación." },
        { tema: "Composición corporal como eje de la planificación en el entrenamiento de la fuerza." },
        { tema: "Adaptaciones al entrenamiento de la fuerza." },
        { tema: "Determinación del tipo de fuerza a entrenar según porcentajes de la fuerza máxima. Cómo determinar 1RM." },
        { tema: "La entrada en calor y la vuelta a la calma." },
        { tema: "La elongación y la flexibilidad. Cuál, cuándo y por qué." },
        { tema: "La progresión y planificación de las cargas." },
        { tema: "Tiempos metabólicos del ejercicio y de su pausa según el objetivo." },
        { tema: "La intensidad, el volumen y la densidad del estímulo en la planificación según objetivos." },
        { tema: "Las distintas manifestaciones de la fuerza." },
        { tema: "Los pesos libres, resistencias elásticas y las máquinas de fuerza." },
        { tema: "Entrenamiento de la fuerza en las diferentes edades." },
        { tema: "Combinaciones de diferentes estímulos de entrenamiento con la fuerza." },
      ],
    },
    {
      tema: "Suplementación de la fuerza",
      subtemas: [
        { tema: "Suplementos según objetivos del entrenamiento." },
        { tema: "Proteínas, aminoácidos, carbohidratos y metabolitos. Los ergogénicos y los restauradores musculares." },
        { tema: "La alimentación en el entrenamiento de la fuerza. Qué ingerir y por qué." },
        { tema: "Las ventanas metabólicas posteriores al entrenamiento que rigen la recuperación orgánica y muscular." },
        { tema: "Planificación de la dosificación de los suplementos según tipo de entrenamiento a ejercitar." },
      ],
    },
  ],
};

export default fuerza;
