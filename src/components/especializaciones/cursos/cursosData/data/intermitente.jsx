import getCourseImage from '../getCourseImage'

const intermitente = {
  title: "El método intermitente",
  subTitle: "En la pérdida de tejido graso y en el rendimiento físico-deportivo",
  bgImage: getCourseImage("intermitente.webp"),
  expositor: 2,
  descripcion: <p>
    El método intermitente, su aplicación tanto en la mejora del rendimiento físico-deportivo como en la pérdida de grasa corporal. Se analizarán diferentes tipos de <strong>entrenamientos interválicos y sus diferencias</strong>, la fisiología y bioquímica subyacente, y cómo las cargas externas e internas afectan el rendimiento. Además, se discutirán las adaptaciones musculares y las respuestas agudas y crónicas a este tipo de ejercicio, tanto en el campo como en el gimnasio.
    <br /><br />
    En el contexto de la pérdida de grasa corporal, se revisarán las <strong>características de la masa muscular en personas con obesidad</strong>, los sistemas energéticos y hormonales involucrados, y los criterios para seleccionar ejercicios adecuados. Se presentarán evidencias científicas sobre la efectividad del método intermitente en la reducción del tejido graso, proporcionando una base sólida para su implementación en <strong>programas de entrenamiento</strong>.
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
      tema: "La mejora del rendimiento competitivo",
      subtemas: [
        { tema: "Entrenamientos interválicos (HIIT) e intermitentes EI: Tipos y diferencias" },
        { tema: "Fisiología y bioquímica de HIIT y en el EI" },
        { tema: "Carga externa y carga interna en el HIIT y en el EI. Similitudes y diferencias en ambas modalidades de entrenamiento" },
        { tema: "Adaptaciones de las fibras musculares participativas en el EI. La importancia de los tipos de pausa de intraesfuerzo y de sesión para mejoras en el rendimiento" },
        { tema: "Respuestas agudas y adaptaciones crónicas en EI" },
        { tema: "EI en campo y en gimnasio. Similitudes y diferencias" },
        { tema: "El EI en deporte. En cuáles y para qué objetivos" },
        { tema: "La planificación cíclica en pretemporada y en período competitivo. Similitudes y diferencias" },
        { tema: "La nutrición y la suplementación en el EI" },
      ],
    },
    {
      tema: "EI en la pérdida de grasa corporal",
      subtemas: [
        { tema: "Masa muscular en las personas con obesidad. Características dominantes" },
        { tema: "Sistemas energéticos y hormonas dominantes en el EI en esfuerzo y en la recuperación en los individuos que padecen exceso de tejido graso" },
        { tema: "Criterios de elección de los ejercicios y ergómetros a utilizar para aplicar EI en las personas con sobrepeso graso u obesas" },
        { tema: "Metodología de la ejercitación para incorporar a la persona obesa en el EI" },
        { tema: "Evidencias científicas sobre los resultados obtenidos al aplicar EI en la pérdida del excedente de tejido graso" },
      ],
    },
  ],
};

export default intermitente;
