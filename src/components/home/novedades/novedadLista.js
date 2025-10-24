import { getImage } from "@/components/funciones/utils/getImages.js";

const novedad = async () => {
  return [
    {
      title: "Responsabilidad civil",
      description:
        "La responsabilidad civil de los docentes afecta su accionar cotidiano y el ejercicio de su rol como garantes de la seguridad de los alumnos. Para profundizar en el tema invitamos a una especialista para brindarles herramientas que permitan prever situaciones perjudiciales para nuestra carrera tan expuesta a daños sufridos por nuestros niños.",
      type: 2,
      page: "/Especializaciones",
      id: "especializacionesCursos",
      imagePath: await getImage("especializaciones/cursos/responsabilidad.webp"),
    },

    {
      title: "IA Aplicada al deporte",
      description:
        "A partir de la consideración de los nuevos escenarios en los que las tecnologías, medios digitales, la inteligencia artificial generativa y las redes sociales se encuentran en expansión, es fundamental para los futuros docentes desarrollar a lo largo de su formación competencias digitales que les permitan desempeñarse profesionalmente.",
      type: 2,
      page: "/Especializaciones",
      id: "especializacionesCursos",
      imagePath: await getImage("especializaciones/cursos/intArtificial.webp"),
    },

    {
      title: "Liderazgo",
      description:
        "Las instituciones educativas y deportivas requieren transformaciones profundas, por eso es clave formar profesionales capaces de liderar. Este curso brinda herramientas para enfrentar el cambio con liderazgo, fortalecer la cultura institucional y aplicar metodologías que generen impacto real y duradero en la sociedad.",
      type: 2,
      page: "/Especializaciones",
      id: "especializacionesCursos",
      imagePath: await getImage("especializaciones/cursos/liderazgo.webp"),
    },

    {
      title: "Laboratorio de investigación",
      description:
        "En este 2025 comenzará la primera etapa de nuestro laboratorio de anatomía funcional, fisiología del ejercicio y nutrición a cargo del Dr. Nelio Bazán. Será una nueva etapa en la historia de nuestra institución, que nos permitirá seguir creciendo y aportando al conocimiento científico.",
      type: 1,
      page: "/Especializaciones",
      id: "especializacionesCursos",
      imagePath: await getImage("especializaciones/cursos/investigacion.webp"),
    },

    {
      title: "Enfermedades vasculares",
      description:
        "Explorá el rol de la mitocondria, el colágeno y los micronutrientes en la prevención y tratamiento de la ECV. Desmitificamos la hipótesis lipídica y aplicamos estrategias de nutrición y ejercicio para una salud vascular real. Dictado por Dr. Jorge Roig, inicia el 06/05.",
      type: 2,
      page: "/Especializaciones",
      id: "especializacionesCursos",
      imagePath: await getImage("especializaciones/cursos/ecv.webp"),
    },

    {
      title: "Fuerza muscular",
      description:
        "Redefiní el entrenamiento con bases bioquímicas, objetivos personalizados y suplementación efectiva. Un curso para quienes buscan resultados reales más allá de las rutinas genéricas. Dictado por Jorge Roig, inicia el 20/05.",
      type: 2,
      page: "/Especializaciones",
      id: "especializacionesCursos",
      imagePath: await getImage("especializaciones/cursos/fuerzaMuscular.webp"),
    },

    {
      title: "Neurociencia y salud mental infantojuvenil",
      description:
        "Comprendé el cerebro joven y desarrollá estrategias para potenciar el aprendizaje, el bienestar emocional y la detección temprana de trastornos. Ciencia y pedagogía, de la mano del Dr. Roberto Rosler. Inicia el 07/05.",
      type: 2,
      page: "/Especializaciones",
      id: "especializacionesCursos",
      imagePath: await getImage("especializaciones/cursos/neuroJuvenil.webp"),
    },
  ];
};

export default novedad;
