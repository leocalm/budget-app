import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: ['i18next', 'react-i18next'],
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
      '@test-utils': path.resolve(dirname, './test-utils'),
    },
  },
  test: {
    environment: 'jsdom',
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.mjs'],
        },
      },
      // Storybook tests disabled due to Playwright browser unavailability
      // {
      //   extends: true,
      //   plugins: [
      //     storybookTest({
      //       configDir: path.join(dirname, '.storybook'),
      //     }),
      //   ],
      //   test: {
      //     name: 'storybook',
      //     browser: {
      //       enabled: true,
      //       headless: true,
      //       provider: playwright({}),
      //       instances: [{ browser: 'chromium' }],
      //     },
      //     setupFiles: ['.storybook/vitest.setup.ts'],
      //   },
      // },
    ],
  },
});
