export const getImageUrl = (imagePath) => {
    try {
      return new URL(imagePath.replace('@/', '/src/'), import.meta.url).href;
    } catch (error) {
      console.error('Error al cargar la imagen:', imagePath, error);
      return ''; // Retorna una imagen vacía si falla
    }
  };
  