import getCourseImage from '../getCourseImage'

const salud = {
  name: "salud",
  title: "Actividad física y salud",
  subTitle: "Fisiopatología de las intervenciones en salud",
  bgImage: getCourseImage("salud.webp"),
  expositor: 1,
  descripcion: <p>
    Este curso analizará la relación entre la actividad física y la salud, explorando las bases fisiopatológicas de diversas intervenciones en salud. Se estudiará la <strong>fisiología del sedentarismo y sus efectos metabólicos</strong>, así como el <strong>crecimiento y desarrollo del tejido óseo y muscular</strong>. Se abordarán las implicancias del balance energético y el gasto energético en la obesidad, así como el metabolismo de los carbohidratos en la diabetes.
    <br /><br />
    También se discutirá la homeostasis muscular y la resistencia anabólica en la sarcopenia y dinapenia, y la microarquitectura del tejido óseo en la osteopenia y osteoporosis. Además, se tratarán las <strong>enfermedades cardiovasculares, la hipertensión arterial, y la hipercolesterolemia</strong>, junto con las alteraciones neurobiológicas y moleculares en la depresión. Este curso proporcionará una <strong>comprensión integral de cómo la actividad física puede intervenir en la mejora de la salud y el manejo de diversas patologías</strong>.
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
      tema: "Sedentarismo",
      subtemas: [
        { tema: "Fisiología de la inactividad física." },
        { tema: "Disfunción metabólica." },
        { tema: "Aumento de triglicéridos (lipoproteína lipasa)." },
        { tema: "Disminución del HDL." },
        { tema: "Cambios en la sensibilidad a la insulina (transportadores de membrana)." },
        { tema: "Densidad mineral ósea y salud ósea." },
      ],
    },
    {
      tema: "Crecimiento y Desarrollo",
      subtemas: [
        { tema: "Tejido óseo y muscular." },
        { tema: "Factores de crecimiento inducidos por el ejercicio." },
        { tema: "Estatura." },
        { tema: "Composición corporal." },
        { tema: "Respuestas hormonales." },
        { tema: "Maduración somática y maduración sexual." },
      ],
    },
    {
      tema: "Obesidad",
      subtemas: [
        { tema: "Balance energético." },
        { tema: "Gasto energético por ejercicio." },
        { tema: "Aumento de masa muscular como tejido metabólicamente activo." },
        { tema: "Metabolismo lipídico." },
        { tema: "Ácidos grasos y triacilgliceroles." },
        { tema: "Síntesis y degradación de lípidos." },
        { tema: "Beta oxidación." },
        { tema: "Metabolismo de los lípidos y ejercicio." },
      ],
    },
    {
      tema: "Diabetes",
      subtemas: [
        { tema: "Metabolismo de los carbohidratos." },
        { tema: "Glucosa." },
        { tema: "Fructosa." },
        { tema: "Almidón." },
        { tema: "Glucógeno." },
        { tema: "Digestión, absorción intestinal, captación tisular, rutas metabólicas de la glucosa." },
        { tema: "Metabolismo de la glucosa en músculo esquelético." },
      ],
    },
    {
      tema: "Sarcopenia y dinapenia",
      subtemas: [
        { tema: "Homeostasis muscular y resistencia anabólica." },
        { tema: "Miostatina y baja de la Akt/mTOR." },
        { tema: "Mioesteatosis." },
        { tema: "Disfunción mitocondrial." },
        { tema: "Disfunción neuromuscular." },
        { tema: "Aleraciones endócrinas." },
      ],
    },
    {
      tema: "Osteopenia y osteoporosis",
      subtemas: [
        { tema: "Microarquitectura del tejido óseo." },
        { tema: "Estirpes celulares." },
        { tema: "Formación y resorción ósea." },
        { tema: "Mineralización y densidad ósea." },
        { tema: "Hueso cortical y trabecular." },
        { tema: "El sistema endocrino y la salud ósea." },
        { tema: "Estímulo óseo por ejercicio con carga." },
      ],
    },
    {
      tema: "Enfermedad cardiovascular",
      subtemas: [
        { tema: "Enfermedades cardiovasculares." },
        { tema: "Cardiopatía coronaria." },
        { tema: "Enfermedad cerebro vascular." },
        { tema: "Arteriopatía periférica." },
        { tema: "Arterioesclerosis." },
        { tema: "Fisiopatología de la circulación coronaria." },
        { tema: "Colesterol y triglicéridos sanguíneos." },
        { tema: "El accidente de placa." },
      ],
    },
    {
      tema: "Hipertensión arterial",
      subtemas: [
        { tema: "Fisiopatología de la hipertensión arterial." },
        { tema: "Mecanismos nerviosos." },
        { tema: "Mecanismos hormonales." },
        { tema: "Sistema renina angiotensina aldosterona." },
        { tema: "Hormona anti diurética." },
        { tema: "Estrés hemodinámico y ejercicio." },
      ],
    },
    {
      tema: "Hipercolesterolemia",
      subtemas: [
        { tema: "Colesterol: absorción intestinal, síntesis endógena, captación tisular, metabolismo lipoproteico, excreción biliar." },
        { tema: "Hipercolesterolemia primaria y secundaria." },
        { tema: "Actividad física y disminución de LDL y TG y aumento de HDL." },
      ],
    },
    {
      tema: "Depresión",
      subtemas: [
        { tema: "Alteraciones neurobiológicas." },
        { tema: "Alteraciones celulares y moleculares." },
        { tema: "Eje hipotalámico-hipofisario-suprarrenal." },
        { tema: "Monoaminas." },
        { tema: "Neurotrofinas." },
        { tema: "Citoquinas." },
        { tema: "Factores epigenéticos." },
        { tema: "Efecto de diferentes tipo de ejercicio." },
      ],
    },
  ],
};

export default salud;
