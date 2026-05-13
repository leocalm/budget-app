import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// Templates the CSP in dist/_headers from runtime env so the same VITE_* vars
// drive both the bundle and the CSP. Cloudflare Pages serves _headers as-is.
function cspHeadersPlugin() {
  return {
    name: 'csp-headers',
    apply: 'build',
    closeBundle() {
      const outFile = resolve(__dirname, 'dist/_headers');
      let contents;
      try {
        contents = readFileSync(outFile, 'utf8');
      } catch {
        return;
      }
      const scriptExtra = new Set();
      const connectExtra = new Set();

      const umamiScript = process.env.VITE_UMAMI_SCRIPT_URL;
      if (umamiScript) {
        try {
          scriptExtra.add(new URL(umamiScript).origin);
        } catch {}
      }
      const umamiHost = process.env.VITE_UMAMI_HOST_URL;
      if (umamiHost) {
        try {
          connectExtra.add(new URL(umamiHost).origin);
        } catch {}
      } else if (umamiScript) {
        try {
          connectExtra.add(new URL(umamiScript).origin);
        } catch {}
      }

      const dsn = process.env.VITE_SENTRY_DSN;
      if (dsn) {
        try {
          connectExtra.add(new URL(dsn).origin);
        } catch {}
      }

      contents = contents.replace(/^(\s*Content-Security-Policy:)(.*)$/m, (_m, prefix, value) => {
        const replaced = value
          .replace('__CSP_SCRIPT_EXTRA__', [...scriptExtra].join(' '))
          .replace('__CSP_CONNECT_EXTRA__', [...connectExtra].join(' '))
          // Collapse the double spaces left when a placeholder resolved to empty.
          .replace(/ {2,}/g, ' ')
          .replace(/ ;/g, ';');
        return `${prefix}${replaced}`;
      });
      writeFileSync(outFile, contents);
    },
  };
}

// Enable HTTPS in the dev server when `VITE_DEV_HTTPS=1` (or any truthy value)
// is set. The Web Crypto API (`window.crypto.subtle`) is only exposed on
// secure contexts — HTTPS, or the literal hosts `localhost` / `127.0.0.1`.
// When testing the encryption flow from a phone on the same LAN, we need to
// hit the dev server over HTTPS, which requires a self-signed cert.
const devHttpsEnabled = Boolean(process.env.VITE_DEV_HTTPS);

// Sentry source-map upload runs only when all three are present, so local/dev
// builds without the secret don't fail.
const sentryUploadEnabled = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
);

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    cspHeadersPlugin(),
    ...(devHttpsEnabled ? [basicSsl()] : []),
    ...(sentryUploadEnabled
      ? [
          sentryVitePlugin({
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            url: process.env.SENTRY_URL,
            release: process.env.SENTRY_RELEASE
              ? { name: process.env.SENTRY_RELEASE }
              : undefined,
          }),
        ]
      : []),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  build: {
    sourcemap: sentryUploadEnabled,
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
