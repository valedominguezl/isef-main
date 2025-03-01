const images = import.meta.glob('/src/assets/media/**/*.webp');

export const getImage = async (relativePath) => {
  const key = `/src/assets/media/${relativePath}`;
  if (images[key]) {
    const module = await images[key]();
    return module.default;
  }
  return ''; 
};
