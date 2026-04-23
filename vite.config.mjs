import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Enable HTTPS in the dev server when `VITE_DEV_HTTPS=1` (or any truthy value)
// is set. The Web Crypto API (`window.crypto.subtle`) is only exposed on
// secure contexts — HTTPS, or the literal hosts `localhost` / `127.0.0.1`.
// When testing the encryption flow from a phone on the same LAN, we need to
// hit the dev server over HTTPS, which requires a self-signed cert.
const devHttpsEnabled = Boolean(process.env.VITE_DEV_HTTPS);

export default defineConfig({
  plugins: [react(), tsconfigPaths(), ...(devHttpsEnabled ? [basicSsl()] : [])],
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
    // Bind to 0.0.0.0 when HTTPS is on so the dev server is reachable from
    // other devices on the LAN. Leave the default (localhost-only) otherwise.
    host: devHttpsEnabled ? true : undefined,
    proxy: {
      '/v1': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/v2': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
