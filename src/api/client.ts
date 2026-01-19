/**
 * Centralized HTTP client with automatic case transformation.
 * - Converts snake_case API responses to camelCase for frontend use
 * - Converts camelCase request payloads to snake_case for the API
 */

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

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
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
  });
  return res;
}

/**
 * GET request with automatic snake_case → camelCase transformation
 */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await baseFetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status}`);
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
    throw new Error(`POST ${url} failed: ${res.status}`);
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
    throw new Error(`PUT ${url} failed: ${res.status}`);
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
export async function apiDelete<T = void>(url: string): Promise<T> {
  const res = await baseFetch(url, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`DELETE ${url} failed: ${res.status}`);
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    return toCamelCase<T>(data);
  }
  return undefined as T;
}
