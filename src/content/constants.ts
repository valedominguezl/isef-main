/** Constantes de contenido sin dependencias (seguras para el bundle público). */

/** Secciones estándar del CV. El orden de esta lista es el orden en que se muestran. */
export const CV_SECCIONES = {
  formacion: 'Formación académica',
  docencia: 'Antecedentes docentes',
  experiencia: 'Experiencia profesional',
  gestion: 'Cargos de gestión',
  investigacion: 'Investigación y publicaciones',
  eventos: 'Congresos, conferencias y disertaciones',
  distinciones: 'Premios y distinciones',
  comunidad: 'Vínculo con la comunidad',
  capacitacion: 'Capacitación continua',
  idiomas: 'Idiomas',
  otros: 'Otros antecedentes',
} as const;
export type CvSeccionTipo = keyof typeof CV_SECCIONES;

export const NOVEDAD_CATEGORIAS = {
  novedad: 'Novedad',
  curso: 'Nuevo curso',
  evento: 'Evento',
  institucional: 'Institucional',
} as const;
