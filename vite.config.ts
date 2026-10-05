import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { localContentApi } from './scripts/vite-content-api.ts';

// Fecha del build: la usan el servidor y el cliente para las reglas por fecha
// (cursos próximos, etiquetas vencidas) sin desajustes de hidratación.
// Fecha del build en hora de Argentina (UTC-3, sin horario de verano): a las 21 h ya es "mañana" en UTC
const BUILD_DATE = process.env.BUILD_DATE ?? new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
process.env.BUILD_DATE = BUILD_DATE;

export default defineConfig({
  plugins: [react(), localContentApi()],
  define: { __BUILD_DATE__: JSON.stringify(BUILD_DATE) },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    manifest: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion';
          return undefined;
        },
      },
    },
  },
  ssr: {
    noExternal: ['react-helmet-async'],
  },
});
