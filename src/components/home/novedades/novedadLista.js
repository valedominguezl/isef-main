import { getImage } from '@/components/funciones/utils/getImages.js';

const novedad = async () => {
  return [
    {
      videoPath: 'https://isefsanluis.net/publi 2025 aulas.mp4',
    },
    {
      title: 'Laboratorio de investigación',
      description:
        'En este 2025 comenzará la primera etapa de nuestro laboratorio de anatomía funcional, fisiología del ejercicio y nutrición, a los efectos de promover y desarrollar investigaciones en las áreas afines. Será una nueva etapa en la historia de nuestra institución, que nos permitirá seguir creciendo y aportando al conocimiento científico.',
      page: '/Especializaciones',
      id: 'especializacionesCursos',
      imagePath: await getImage('especializaciones/cursos/investigacion.webp'),
    },

  ];
};

export default novedad;


