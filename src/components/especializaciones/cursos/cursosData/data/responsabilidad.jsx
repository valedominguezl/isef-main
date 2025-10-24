import getCourseImage from "../getCourseImage";

const responsabilidad = {
  name: "responsabilidad",
  estado: "¡Nuevo!",
  destacado: true,
  title: "Responsabilidad civil de los profesores",
  subTitle: "Educación física en las escuelas",
  bgImage: getCourseImage("responsabilidad.webp"),
  expositor: "Dra. Agustina Gatto",
  descripcion: (
    <p>
      “El titular de un establecimiento educativo responde por el daño causado o
      sufrido por sus alumnos menores de edad cuando se hallen o deban hallarse
      bajo el control de la autoridad escolar. La responsabilidad es objetiva y
      se exime sólo con la prueba del caso fortuito. El establecimiento
      educativo debe contratar un seguro de responsabilidad civil, de acuerdo a
      los requisitos que fije la autoridad en materia aseguradora. Esta norma no
      se aplica a los establecimientos de educación superior o universitaria.” —{" "}
      <strong>
        Artículo 1767. Responsabilidad de los establecimientos educativos.
        Código Civil y Comercial de la Nación.
      </strong>
      <br /> <br />
      La responsabilidad civil de los docentes en la escuela es un tema
      importante y con{" "}
      <strong>implicancias legales, éticas y profesionales</strong>. Afecta
      directamente su accionar cotidiano, su relación con estudiantes, colegas y
      autoridades, y el ejercicio de su rol como garantes del bienestar y la
      seguridad de los alumnos. Para profundizar en el tema invitamos a una
      especialista para brindarles herramientas y estrategias que permitan
      prever <strong>situaciones perjudiciales</strong> para nuestra carrera,
      <strong>tan expuesta a daños sufridos por nuestros niños</strong>.
    </p>
  ),
  duracion: "28/10 y 30/10 de 20:15 a 21:30 horas",
  modalidad: "Zoom",
  costo: null,
  inicio: "28/10/2025",
  importante: null,
  condiciones: null,
  temario: [
    {
      tema: "Módulo I: Introducción al Derecho y la Responsabilidad",
      subtemas: [
        { tema: "Conceptos básicos del Derecho" },
        { tema: "Ramas del Derecho: público y privado" },
        { tema: "Principios constitucionales" },
        { tema: "Concepto general de responsabilidad" },
        { tema: "Elementos de la responsabilidad civil" },
      ],
    },
    {
      tema: "Módulo II: La Responsabilidad Civil en el Ámbito Educativo",
      subtemas: [
        { tema: "Marco normativo del sistema educativo argentino" },
        { tema: "Relaciones jurídicas en la escuela" },
        { tema: "Responsabilidad civil docente" },
        { tema: "Factores de atribución: culpa, dolo y riesgo" },
        { tema: "Análisis de casos prácticos" },
      ],
    },
    {
      tema: "Módulo III: El Daño, la Prevención y el Seguro Educativo",
      subtemas: [
        { tema: "Concepto de daño en el ámbito escolar" },
        { tema: "Prevención y seguridad en la práctica docente" },
        { tema: "Seguros escolares y docentes" },
        { tema: "Responsabilidad compartida" },
        { tema: "Protocolos de actuación ante accidentes" },
      ],
    },
    {
      tema: "Módulo IV: Ética, Responsabilidad y Práctica Profesional",
      subtemas: [
        { tema: "Ética y derecho en la función docente" },
        {
          tema: "Ejercicio responsable de la autoridad",
        },
        { tema: "Responsabilidad penal y administrativa (nociones)" },
        { tema: "Responsabilidad digital y cuidado de la imagen" },
        { tema: "Síntesis y reflexión final sobre el rol docente" },
      ],
    },
  ],
};

export default responsabilidad;
