import getCourseImage from '../getCourseImage'

const ecnt = {
  name: "ecnt",
  title: "Enfermedades crónicas no transmisibles",
  subTitle: "Prevención y manejo de las enfermedades hipocinéticas",
  bgImage: getCourseImage("ecnt.webp"),
  expositor: 1,
  descripcion: <p>
    Se ofrece una visión integral sobre las <strong>enfermedades asociadas al sedentarismo</strong> y las estrategias para su prevención y manejo. A lo largo de diversas clases, se abordan aspectos fundamentales como la relación entre actividad física y sedentarismo, la obesidad, la diabetes, las enfermedades cardiovasculares, la salud ósea y la sarcopenia.
    <br /><br />
    El curso se enfoca en entender los <strong>mecanismos fisiopatológicos subyacentes</strong>, la epidemiología, y las distintas opciones de tratamiento, incluyendo la nutrición, la farmacología y la cirugía. Además, se pone un énfasis especial en la <strong>prescripción del ejercicio</strong> como herramienta clave para mejorar la salud y la calidad de vida. <strong>Este curso es esencial para profesionales de la salud, la educación física y cualquier persona interesada en la promoción de un estilo de vida activo y saludable</strong>.
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
      tema: "Clase 1: Enfermedades hipocinéticas",
      subtemas: [
        { tema: "Actividad física, sedentarismo y enfermedad." },
        { tema: "Aspectos históricos." },
        { tema: "Mecanismos fisiopatológicos comunes." },
        { tema: "Epidemiología de las enfermedades hipocinéticas en nuestro país y el mundo." },
        { tema: "Encuesta Nacional de Factores de Riesgo." },
      ],
    },
    {
      tema: "Clase 2: Obesidad y actividad física.",
      subtemas: [
        { tema: "Diagnóstico de la obesidad." },
        { tema: "Fisiopatología." },
        { tema: "Tratamientos: nutrición, farmacología y cirugía." },
        { tema: "Ejercicio en el tratamiento de la obesidad." },
        { tema: "Obesidad infantil, características, fisiopatología, valoración funcional y prescripción del ejercicio." },
      ],
    },
    {
      tema: "Clase 3: Diabetes y actividad física.",
      subtemas: [
        { tema: "Clasificación de la diabetes." },
        { tema: "Mecanismos fisiopatológicos." },
        { tema: "Vías metabólicas involucradas." },
        { tema: "Tratamiento nutricional y farmacológico." },
        { tema: "Respuesta al ejercicio." },
        { tema: "Adaptaciones fisiológicas inducidas por el ejercicio." },
        { tema: "Prescripción del ejercicio." },
        { tema: "Precauciones con el paciente diabético." },
      ],
    },
    {
      tema: "Clase 4: Enfermedad cardiovascular y actividad física.",
      subtemas: [
        { tema: "Cardiopatía isquémica." },
        { tema: "Insuficiencia cardíaca." },
        { tema: "Respuestas hemodinámicas durante el ejercicio en la insuficiencia cardíaca." },
        { tema: "Efectos del entrenamiento físico en la insuficiencia cardíaca." },
        { tema: "Recomendaciones generales para programas de ejercicio en la rehabilitación cardíaca." },
        { tema: "Entrenamiento de la fuerza en rehabilitación cardíaca." },
        { tema: "Hipertensión arterial y ejercicio." },
      ],
    },
    {
      tema: "Clase 5: Salud ósea y actividad física.",
      subtemas: [
        { tema: "Características generales del tejido óseo y remodelado óseo." },
        { tema: "Mecanostato de Frost." },
        { tema: "Factores asociados a la osteopenia y osteoporosis: actividad física, nutrición y hormonas." },
        { tema: "Indicación de ejercicio en osteoporosis." },
      ],
    },
    {
      tema: "Clase 6: Sarcopenia, dinapenia y actividad física.",
      subtemas: [
        { tema: "El músculo como tejido metabólicamente activo." },
        { tema: "Caracterización de la sarcopenia." },
        { tema: "Fisiopatología." },
        { tema: "Cambios en el músculo relacionado con la edad." },
        { tema: "Evaluación de la fuerza en población general." },
        { tema: "Prescripción del ejercicio." },
      ],
    },
  ],
};

export default ecnt;
