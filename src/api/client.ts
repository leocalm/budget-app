import { ApiError } from './errors';

/**
 * Centralized HTTP client with automatic case transformation.
 * - Converts snake_case API responses to camelCase for frontend use
 * - Converts camelCase request payloads to snake_case for the API
 */

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const DEFAULT_API_VERSION = 'v1';
const VERSIONED_API_PREFIX = /^\/api\/v\d+(?:[/?#]|$)/;
const LOGIN_PATH_PATTERN = /\/api(?:\/v\d+)?\/users\/login(?:[/?#]|$)/;

function normalizeApiVersion(version: string): string {
  if (!version) {
    return DEFAULT_API_VERSION;
  }
  const trimmed = String(version).trim();
  if (!trimmed) {
    return DEFAULT_API_VERSION;
  }
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
}

function normalizeBasePath(basePath: string): string {
  if (!basePath) {
    return `/api/${DEFAULT_API_VERSION}`;
  }
  const trimmed = String(basePath).trim();
  if (!trimmed) {
    return `/api/${DEFAULT_API_VERSION}`;
  }

  if (isAbsoluteUrl(trimmed)) {
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

// Allow configuration via env: VITE_API_BASE_PATH (full path) or VITE_API_VERSION (e.g. "v1" or "1").
function resolveApiBasePath(): string {
  const env = import.meta.env;
  const rawVersion = env?.VITE_API_VERSION;
  const version = typeof rawVersion === 'string' ? rawVersion.trim() : undefined;
  const explicitBasePath = env?.VITE_API_BASE_PATH;
  if (explicitBasePath) {
    const normalizedBasePath = normalizeBasePath(explicitBasePath);
    if (!version) {
      return normalizedBasePath;
    }

    const normalizedVersion = normalizeApiVersion(version);
    if (hasVersionPathSegment(normalizedBasePath)) {
      return normalizedBasePath;
    }

    return `${normalizedBasePath}/${normalizedVersion}`;
  }

  const normalizedVersion = version ? normalizeApiVersion(version) : DEFAULT_API_VERSION;
  return normalizeBasePath(`/api/${normalizedVersion}`);
}

const API_BASE_PATH = resolveApiBasePath();

function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//');
}

function hasVersionPathSegment(pathOrUrl: string): boolean {
  const versionPattern = /\/v\d+(?:\/|$)/;

  if (!isAbsoluteUrl(pathOrUrl)) {
    return versionPattern.test(pathOrUrl);
  }

  try {
    const parsed = pathOrUrl.startsWith('//')
      ? new URL(pathOrUrl, 'https://placeholder.local')
      : new URL(pathOrUrl);
    return versionPattern.test(parsed.pathname);
  } catch {
    return versionPattern.test(pathOrUrl);
  }
}

function resolveApiUrl(url: string): string {
  if (isAbsoluteUrl(url) || !url.startsWith('/api')) {
    return url;
  }

  if (VERSIONED_API_PREFIX.test(url)) {
    return url;
  }

  if (url === '/api' || url.startsWith('/api?') || url.startsWith('/api#')) {
    return `${API_BASE_PATH}${url.slice('/api'.length)}`;
  }

  if (url.startsWith('/api/')) {
    return `${API_BASE_PATH}${url.slice('/api'.length)}`;
  }

  return url;
}

/**
 * Converts a snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function getErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return `Request failed: ${status}`;
}

function clearStoredUser(): void {
  try {
    localStorage.removeItem('user');
  } catch {
    // Ignore storage access errors (e.g., during SSR or locked storage).
  }

  try {
    sessionStorage.removeItem('user');
  } catch {
    // Ignore storage access errors (e.g., during SSR or locked storage).
  }
}

export const navigation = {
  assign: (url: string): void => {
    if (typeof window === 'undefined') {
      return;
    }

    window.location.assign(url);
  },
};

function redirectToLogin(): void {
  try {
    navigation.assign('/auth/login');
  } catch {
    // Ignore navigation errors (e.g., during tests).
  }
}

function isAuthRoute(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.pathname.startsWith('/auth');
}

function isLoginRequest(url: string): boolean {
  return LOGIN_PATH_PATTERN.test(url);
}

async function parseErrorBody(res: Response): Promise<unknown> {
  const raw = await res.text();
  if (!raw) {
    return undefined;
  }

  try {
    return toCamelCase(JSON.parse(raw));
  } catch {
    return raw;
  }
}

async function throwForStatus(res: Response, url: string): Promise<never> {
  const data = await parseErrorBody(res);
  const message = getErrorMessage(data, res.status);

  if (res.status === 401) {
    clearStoredUser();
    if (!isLoginRequest(url) && !isAuthRoute()) {
      redirectToLogin();
    }
  }

  throw new ApiError(message, res.status, url, data);
}

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 */
export function toCamelCase<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }

  if (typeof obj === 'object') {
    const converted: JsonObject = {};
    for (const [key, value] of Object.entries(obj as JsonObject)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = toCamelCase(value);
    }
    return converted as T;
  }

  return obj as T;
}

/**
 * Recursively converts all keys in an object from camelCase to snake_case
 */
export function toSnakeCase<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as T;
  }

  if (typeof obj === 'object') {
    const converted: JsonObject = {};
    for (const [key, value] of Object.entries(obj as JsonObject)) {
      const snakeKey = camelToSnake(key);
      converted[snakeKey] = toSnakeCase(value);
    }
    return converted as T;
  }

  return obj as T;
}

/**
 * Base fetch wrapper with error handling
 */
async function baseFetch(url: string, options?: RequestInit): Promise<Response> {
  return fetch(resolveApiUrl(url), {
    ...options,
    credentials: 'include',
  });
}

/**
 * GET request with automatic snake_case → camelCase transformation
 */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await baseFetch(url);
  if (!res.ok) {
    await throwForStatus(res, url);
  }
  const data = await res.json();
  if ('data' in data) {
    return toCamelCase<T>(data.data);
  }
  return toCamelCase<T>(data);
}

/**
 * GET request with snake_case → camelCase transformation without envelope unwrapping.
 * Use this when the response metadata (e.g., pagination cursors) must be preserved.
 */
export async function apiGetRaw<T>(url: string): Promise<T> {
  const res = await baseFetch(url);
  if (!res.ok) {
    await throwForStatus(res, url);
  }
  const data = await res.json();
  return toCamelCase<T>(data);
}

/**
 * POST request with automatic case transformations
 * - Request body: camelCase → snake_case
 * - Response: snake_case → camelCase
 */
export async function apiPost<T, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await baseFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
  });
  if (!res.ok) {
    await throwForStatus(res, url);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return toCamelCase<T>(data);
  }
  // Handle text responses (e.g., returning an ID)
  const text = await res.text();
  return text as T;
}

/**
 * PUT request with automatic case transformations
 * - Request body: camelCase → snake_case
 * - Response: snake_case → camelCase
 */
export async function apiPut<T, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await baseFetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
  });
  if (!res.ok) {
    await throwForStatus(res, url);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return toCamelCase<T>(data);
  }
  return undefined as T;
}

/**
 * PATCH request with optional body and response transformation
 */
export async function apiPatch<T = void, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await baseFetch(url, {
    method: 'PATCH',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
  });
  if (!res.ok) {
    await throwForStatus(res, url);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return toCamelCase<T>(data);
  }
  return undefined as T;
}

/**
 * DELETE request with optional response transformation
 */
export async function apiDelete<T = void, B = unknown>(url: string, body?: B): Promise<T> {
  const res = await baseFetch(url, {
    method: 'DELETE',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
  });
  if (!res.ok) {
    await throwForStatus(res, url);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return toCamelCase<T>(data);
  }
  return undefined as T;
}
