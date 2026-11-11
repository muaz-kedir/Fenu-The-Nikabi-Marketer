import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const localApiPlugin: Plugin = {
  name: 'local-postgres-api',
  async configureServer(server) {
    const { default: api } = await import('./server/index.js');
    server.middlewares.use(api);
  },
  async configurePreviewServer(server) {
    const { default: api } = await import('./server/index.js');
    server.middlewares.use(api);
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), localApiPlugin],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
