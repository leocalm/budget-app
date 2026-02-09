import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type ApiMode = 'mock' | 'real';
export type E2ETarget = 'local' | 'docker';

interface E2EEnv {
  apiMode: ApiMode;
  target: E2ETarget;
  baseUrl: string;
  apiUrl: string;
  apiHealthPath: string;
  webServerHost: string;
  webServerPort: number;
  registerEndpoints: string[];
}

function readDotEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {};
  }

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const values: Record<string, string> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    if (key.length > 0) {
      values[key] = value;
    }
  }

  return values;
}

function getEnvValue(name: string, fallback: string, fileEnv: Record<string, string>): string {
  return process.env[name] ?? fileEnv[name] ?? fallback;
}

function parseMode(value: string): ApiMode {
  return value === 'real' ? 'real' : 'mock';
}

function parseTarget(value: string): E2ETarget {
  return value === 'docker' ? 'docker' : 'local';
}

const envFile = readDotEnvFile(resolve(process.cwd(), '.env.test'));

const target = parseTarget(getEnvValue('E2E_TARGET', 'local', envFile));
const defaultBaseUrl = target === 'docker' ? 'https://localhost:18443' : 'http://127.0.0.1:5173';

export const e2eEnv: E2EEnv = {
  apiMode: parseMode(getEnvValue('E2E_API_MODE', 'mock', envFile)),
  target,
  baseUrl: getEnvValue('E2E_BASE_URL', defaultBaseUrl, envFile),
  apiUrl: getEnvValue('E2E_API_URL', 'http://127.0.0.1:8000', envFile),
  apiHealthPath: getEnvValue('E2E_API_HEALTH_PATH', '/api/v1/health', envFile),
  webServerHost: getEnvValue('E2E_WEB_HOST', '127.0.0.1', envFile),
  webServerPort: Number.parseInt(getEnvValue('E2E_WEB_PORT', '5173', envFile), 10),
  registerEndpoints: getEnvValue(
    'E2E_REGISTER_ENDPOINTS',
    '/api/v1/users/register,/api/users/register',
    envFile
  )
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean),
};
