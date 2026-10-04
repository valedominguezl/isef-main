import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { localContentApi } from './scripts/vite-content-api';

// Fecha del build: la usan el servidor y el cliente para las reglas por fecha
// (cursos próximos, etiquetas vencidas) sin desajustes de hidratación.
const BUILD_DATE = process.env.BUILD_DATE ?? new Date().toISOString().slice(0, 10);
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
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
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
