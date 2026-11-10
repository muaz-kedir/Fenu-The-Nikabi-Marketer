import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import api from './server/index.js';

const localApiPlugin: Plugin = {
  name: 'local-postgres-api',
  configureServer(server) {
    server.middlewares.use(api);
  },
  configurePreviewServer(server) {
    server.middlewares.use(api);
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
