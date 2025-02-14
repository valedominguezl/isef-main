const getCourseImage = (imageName) => {
    return new URL(`/src/assets/media/especializaciones/cursos/${imageName}`, import.meta.url).href;
};

export default getCourseImage;
