const modules = import.meta.glob('./data/*.jsx', { eager: true });
const cursosData = [];

for (const path in modules) {
  cursosData.push(modules[path].default);
}

const cursosOrdenados = cursosData.sort((a, b) => {
  const prioridad = curso => {
    if (curso.destacado) return 0;    // más prioritario
    if (curso.estado) return 1;         // prioridad intermedia (con badge)
    return 2;                           // sin prioridad
  };

  return prioridad(a) - prioridad(b);
});

export default cursosOrdenados;