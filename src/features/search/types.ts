export type SearchType = 'pagina' | 'seccion' | 'curso' | 'novedad' | 'disertante' | 'faq' | 'materia';

export interface SearchDoc {
  id: string;
  type: SearchType;
  title: string;
  /** Texto plano indexado (recortado). */
  text: string;
  url: string;
  /** Página o colección a la que pertenece (se muestra como contexto). */
  context?: string;
  keywords?: string;
}

export const TYPE_LABELS: Record<SearchType, string> = {
  pagina: 'Páginas',
  seccion: 'En el sitio',
  curso: 'Especializaciones',
  novedad: 'Novedades',
  disertante: 'Disertantes',
  faq: 'Preguntas frecuentes',
  materia: 'Plan de estudios',
};

export const TYPE_ORDER: SearchType[] = ['pagina', 'curso', 'faq', 'seccion', 'disertante', 'novedad', 'materia'];
