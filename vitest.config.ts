import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: [
      'i18next',
      'react-i18next',
      'react-dom/client',
      'recharts/es6/component/responsiveContainerUtils',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@test-utils': path.resolve(dirname, './test-utils'),
    },
  },
  test: {
    environment: 'jsdom',
    name: 'unit',
    globals: true,
    setupFiles: ['./vitest.setup.mjs'],
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
});
