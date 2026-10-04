/**
 * Documentos del índice de búsqueda a partir del contenido. El prerender agrega además
 * las secciones de cada página renderizada (texto estático de los componentes).
 */
import { cursos, disertantes, faq, inscripciones, nombreCompleto, novedades, plan } from '@/content';
import { toPlainText } from '@/lib/markdown';
import type { SearchDoc } from './types';

const clip = (s: string, n = 1200) => (s.length > n ? s.slice(0, n) : s);

export const PAGES: SearchDoc[] = [
  { id: 'p-inicio', type: 'pagina', title: 'Inicio', url: '/', text: 'Profesorado de educación física en San Luis y Villa Mercedes desde 1993.', keywords: 'home isef instituto' },
  { id: 'p-carrera', type: 'pagina', title: 'La carrera', url: '/carrera', text: 'Profesorado de Educación Física: título oficial, 4 años, presencial, plan de estudios, validez nacional, gabinete psicopedagógico.', keywords: 'profesorado titulo duracion horarios plan estudios validez' },
  { id: 'p-plan', type: 'pagina', title: 'Plan de estudios', url: '/carrera#plan', text: `Materias de 1° a 4° año. ${plan.horasReloj} horas reloj, ${plan.horasCatedra} horas cátedra.`, context: 'La carrera', keywords: 'materias asignaturas correlativas' },
  { id: 'p-inscripciones', type: 'pagina', title: 'Inscripciones', url: '/inscripciones', text: toPlainText(inscripciones.intro), keywords: 'inscribirme anotarme requisitos ficha examenes medicos mayores de 25 secundario' },
  { id: 'p-especializaciones', type: 'pagina', title: 'Especializaciones', url: '/especializaciones', text: 'Cursos y talleres gratuitos con científicos de renombre: neurociencias, nutrición, fuerza, salud, inteligencia artificial.', keywords: 'cursos talleres capacitaciones' },
  { id: 'p-novedades', type: 'pagina', title: 'Novedades', url: '/novedades', text: 'Noticias del profesorado: nuevos cursos, eventos y anuncios institucionales.', keywords: 'noticias' },
  { id: 'p-contacto', type: 'pagina', title: 'Contacto y sedes', url: '/contacto', text: 'Teléfonos de rectoría, secretaría académica y administrativa. Sedes de San Luis y Villa Mercedes con mapas.', keywords: 'telefono whatsapp direccion mapa ubicacion mail' },
  { id: 'p-campus', type: 'pagina', title: 'Campus virtual', url: 'https://campus.isefsanluis.net/', text: 'Acceso al campus virtual del profesorado.', keywords: 'chamilo aula virtual' },
  { id: 'p-privacidad', type: 'pagina', title: 'Política de privacidad', url: '/privacidad', text: 'Cómo tratamos tus datos y cookies.', keywords: 'cookies datos' },
];

export function contentDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [...PAGES];
  for (const c of cursos) {
    const temario = c.temario.map((t) => [t.tema, ...t.subtemas].join(' ')).join(' ');
    const dis = c.disertantes.map((s) => disertantes.find((d) => d.slug === s)).filter(Boolean).map((d) => nombreCompleto(d!)).join(', ');
    docs.push({
      id: `c-${c.slug}`,
      type: 'curso',
      title: c.titulo,
      url: `/especializaciones/${c.slug}`,
      context: c.subtitulo,
      keywords: [dis, c.modalidad, c.etiqueta].filter(Boolean).join(' '),
      text: clip(`${c.subtitulo}. ${toPlainText(c.descripcion)} ${temario}`),
    });
  }
  for (const d of disertantes) {
    docs.push({
      id: `d-${d.slug}`,
      type: 'disertante',
      title: nombreCompleto(d),
      url: `/disertantes/${d.slug}`,
      context: d.especialidad,
      text: d.destacados.join('. '),
      keywords: 'cv curriculum profesor cientifico',
    });
  }
  for (const n of novedades) {
    docs.push({ id: `n-${n.slug}`, type: 'novedad', title: n.titulo, url: `/novedades/${n.slug}`, context: n.fecha, text: clip(`${n.resumen} ${toPlainText(n.cuerpo)}`) });
  }
  faq.preguntas.forEach((q, i) =>
    docs.push({ id: `f-${i}`, type: 'faq', title: q.pregunta, url: `/#faq-${i}`, context: 'Preguntas frecuentes', text: toPlainText(q.respuesta) }),
  );
  plan.anios.forEach((a) =>
    a.materias.forEach((m, j) =>
      docs.push({
        id: `m-${a.anio}-${j}`,
        type: 'materia',
        title: m.nombre,
        url: '/carrera#plan',
        context: `${a.anio}${m.tipo ? ` · ${m.tipo}` : ''}${m.horas ? ` · ${m.horas} h` : ''}`,
        text: `${m.nombre} ${a.anio}`,
      }),
    ),
  );
  return docs;
}
