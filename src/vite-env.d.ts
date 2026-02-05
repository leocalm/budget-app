/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_VERSION?: string;
  readonly VITE_API_BASE_PATH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
