import getCourseImage from "../getCourseImage";

const intArtificial = {
  name: "intArtificial",
  estado: "¡Nuevo!",
  destacado: true,
  title: "Inteligencia artificial",
  subTitle: "Su aplicación en el deporte",
  bgImage: getCourseImage("intArtificial.webp"),
  expositor: "Dr. Walter Agüero",
  descripcion: (
    <p>
      Las competencias digitales transversales en la Formación Docente Inicial
      establecen la incorporación de los modelos híbridos en línea con lo
      dispuesto por la Resolución CFE 476/24{" "}
      <strong>
        “Lineamientos curriculares nacionales para la formación docente inicial”
      </strong>{" "}
      que promueve el desarrollo de competencias digitales.
      <br />
      <br />A partir de la consideración de los nuevos escenarios en los que las
      tecnologías, medios digitales, la inteligencia artificial generativa y
      las redes sociales se encuentran en expansión, es fundamental para los
      futuros docentes desarrollar a lo largo de su formación{" "}
      <strong>
        competencias digitales que les permitan desempeñarse profesionalmente
      </strong>
      . <br /> <br />
      Atendiendo a estas nuevas normativas, a partir de septiembre iniciamos un
      ciclo de capacitaciones con un{" "}
      <strong>especialista de renombre internacional</strong>
      formado en <strong>Corea, Brasil y San Luis</strong>, magíster, doctorado{" "}
      <strong>Walter Agüero</strong>, quien diserta en este continente y también
      en Europa.
    </p>
  ),
  duracion: "3 meses. 1 clase por mes, de 16 a 18 horas",
  modalidad: "Online por Zoom",
  costo: null,
  inicio: "08/09/2025",
  importante: null,
  condiciones: null,
  temario: [
    {
      tema: "Introducción a la IA en el Deporte",
      subtemas: [
        { tema: "¿Qué es la IA y cómo se aplica en el deporte?" },
        { tema: "Beneficios y desafíos de la IA en el ámbito deportivo." },
        {
          tema: "Ejemplos de éxito: Casos de equipos y atletas que usan IA.",
        },
      ],
    },
    {
      tema: "Tecnologías Clave de IA en el Deporte",
      subtemas: [
        {
          tema: "Análisis de datos y machine learning para rendimiento deportivo.",
        },
        {
          tema: "Visión por computadora: Seguimiento de movimientos y gestos técnicos.",
        },
        {
          tema: "Wearables y sensores inteligentes para monitoreo en tiempo real.",
        },
      ],
    },
    {
      tema: "Aplicaciones Prácticas de la IA",
      subtemas: [
        {
          tema: "Scouting y reclutamiento de talentos con IA.",
        },
        {
          tema: "Personalización de entrenamientos usando algoritmos predictivos.",
        },
        {
          tema: "Prevención de lesiones mediante modelos de riesgo.",
        },
      ],
    },
    {
      tema: "Implementación y Futuro de la IA en el Deporte",
      subtemas: [
        {
          tema: "Cómo integrar herramientas de IA en equipos y organizaciones.",
        },
        { tema: "Ética y privacidad en el uso de datos deportivos." },
        {
          tema: "Tendencias futuras: Realidad virtual, metaverso y deportes electrónicos.",
        },
      ],
    },
  ],
};

export default intArtificial;
