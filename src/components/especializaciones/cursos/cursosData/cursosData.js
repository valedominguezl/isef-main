const modules = import.meta.glob('./data/*.jsx', { eager: true });
const cursosData = [];

for (const path in modules) {
  cursosData.push(modules[path].default);
}

export default cursosData;
