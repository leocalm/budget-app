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
    // Increase slightly if you still want a higher warning threshold (keeps default behavior otherwise)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Create smaller vendor chunks by splitting node_modules per package.
        // Group some related packages into named chunks for better caching.
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          // Extract package name from the path after node_modules/
          const parts = id.split('node_modules/')[1].split('/');
          let pkg = parts[0];
          // Handle scoped packages like @mantine/core -> @mantine/core
          if (pkg.startsWith('@') && parts.length > 1) {
            pkg = `${pkg}/${parts[1]}`;
          }

          // Group some big libraries together for a smaller number of chunks
          if (
            pkg === 'react' ||
            pkg === 'react-dom' ||
            pkg === 'scheduler' ||
            pkg === 'use-sync-external-store'
          ) {
            return 'react';
          }

          if (pkg === 'recharts' || pkg === '@mantine/charts') {
            return 'charts';
          }

          if (pkg.startsWith('@mantine')) {
            return 'mantine';
          }

          if (pkg.startsWith('@tanstack')) {
            return 'tanstack';
          }

          if (pkg === 'i18next' || pkg === 'react-i18next') {
            return 'i18n';
          }

          // Fallback: use the package name as chunk name (sanitize scoped package names)
          return pkg.replace('@', '').replace('/', '-');
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
