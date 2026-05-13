/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_VERSION?: string;
  readonly VITE_API_BASE_PATH?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_SENTRY_RELEASE?: string;
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  readonly VITE_UMAMI_SCRIPT_URL?: string;
  readonly VITE_UMAMI_WEBSITE_ID?: string;
  readonly VITE_UMAMI_HOST_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
