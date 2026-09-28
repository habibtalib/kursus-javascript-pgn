// vite.config.js — konfigurasi Vite 7
import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5173, open: false },
  build: {
    // Pustaka format geospatial dimuat secara dinamik (import()) → chunk berasingan
    chunkSizeWarningLimit: 1500,
  },
});
