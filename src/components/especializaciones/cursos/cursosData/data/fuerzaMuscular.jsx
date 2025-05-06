import getCourseImage from '../getCourseImage'

const fuerzaMuscular = {
  estado: "¡Nuevo!",
  name: "fuerzaMuscular",
  title: "Fuerza muscular",
  subTitle: "Entrenamiento, nutrición y suplementación de nutrientes",
  bgImage: getCourseImage("fuerzaMuscular.webp"),
  expositor: 2,
  descripcion: <p>
  Este curso invita a repensar el <strong>entrenamiento de la fuerza muscular</strong> desde una perspectiva integral y crítica. A lo largo del cursado, se abordarán los <strong>objetivos realistas y alcanzables</strong> del entrenamiento según la evaluación inicial del practicante, considerando su <strong>composición corporal</strong> y sus posibilidades reales de cambio. Se discutirá la ineficacia de aplicar <strong>programas genéricos</strong> o de “talle único” sin contemplar los propósitos individuales, ya sea con fines estéticos o de rendimiento.

  <br /><br />

  Se profundizará en el conocimiento de la <strong>bioquímica energética</strong> implicada en las distintas manifestaciones de la fuerza, desmontando prácticas habituales como las <strong>pausas intuitivas</strong> y destacando la necesidad de adaptar los métodos al metabolismo energético dominante en cada objetivo. Comprender <strong>qué sistema energético se activa</strong> en cada tipo de estímulo es clave para evitar frustraciones y maximizar los resultados.

  <br /><br />
  
  Por último, se subraya la importancia de integrar el entrenamiento con una <strong>nutrición adecuada</strong> y una <strong>suplementación específica de micronutrientes</strong>. Se trabajará sobre cómo articular estos factores con el estímulo físico para lograr adaptaciones reales y sostenibles. Este curso está diseñado para quienes buscan <strong>criterios de aplicación práctica y profesional</strong>, más allá de lo que puede encontrarse en rutinas estándar o en redes sociales.
</p>
  ,
  duracion: null,
  modalidad: null,
  costo: null,
  inicio: "20/05/2025",
  importante: null,
  condiciones: null,
  temario: [
    {
      tema: "Temario general",
      subtemas: [
        { tema: "Objetivos procurados y posibles de alcanzar." },
        { tema: "Programas de entrenamiento (¿Talle único?)." },
        { tema: "Ejercitaciones sin conocimiento de la bioquímica energética que actúa." },
        { tema: "Pausas \"intuitivas\"." },	
        { tema: "Búsqueda de mejoras sin aptitudes para esos cambios." },
        { tema: "Entrenamiento sin orientación nutricional y suplementación específica." },
      ],
    },
  ],
};

export default fuerzaMuscular;
