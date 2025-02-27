import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: true, 
    outDir: 'dist', 
    rollupOptions: {
      input: path.resolve(__dirname, 'src/entry-server.jsx')
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
