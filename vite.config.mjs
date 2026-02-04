import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/use-sync-external-store/')
          ) {
            return 'react';
          }
          if (id.includes('recharts') || id.includes('@mantine/charts')) {
            return 'charts';
          }
          if (id.includes('@mantine')) {
            return 'mantine';
          }
          if (id.includes('@tanstack')) {
            return 'tanstack';
          }
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          return 'vendor';
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    },
  }
});
