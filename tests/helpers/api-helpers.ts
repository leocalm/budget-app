import type { APIRequestContext } from 'playwright/test';
import type { TestUserCredentials } from './test-data';

interface ApiUser {
  id: string;
  name: string;
  email: string;
}

interface CreateUserResult {
  user: ApiUser;
  endpoint: string;
}

function toAbsoluteUrl(baseUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${normalizedBase}${normalizedPath}`;
}

export async function createUserViaApi(
  request: APIRequestContext,
  apiBaseUrl: string,
  credentials: TestUserCredentials,
  registerEndpoints: string[]
): Promise<CreateUserResult> {
  const errors: string[] = [];

  for (const registerEndpoint of registerEndpoints) {
    const url = toAbsoluteUrl(apiBaseUrl, registerEndpoint);

    try {
      const response = await request.post(url, {
        data: {
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        },
      });

      if (!response.ok()) {
        const body = await response.text();
        errors.push(`${registerEndpoint}: ${response.status()} ${body}`);
        continue;
      }

      const rawBody = await response.text();
      const parsedBody = rawBody ? (JSON.parse(rawBody) as unknown) : undefined;
      const user = extractUser(parsedBody, credentials);

      return {
        user,
        endpoint: registerEndpoint,
      };
    } catch (error) {
      errors.push(`${registerEndpoint}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Unable to create test user via API. Attempts: ${errors.join(' | ')}`);
}

function extractUser(payload: unknown, credentials: TestUserCredentials): ApiUser {
  if (payload && typeof payload === 'object') {
    const asRecord = payload as Record<string, unknown>;

    const directId = asRecord.id;
    const directEmail = asRecord.email;
    const directName = asRecord.name;

    if (
      typeof directId === 'string' &&
      typeof directEmail === 'string' &&
      typeof directName === 'string'
    ) {
      return {
        id: directId,
        email: directEmail,
        name: directName,
      };
    }

    const nestedUser = asRecord.user;
    if (nestedUser && typeof nestedUser === 'object') {
      const nestedRecord = nestedUser as Record<string, unknown>;
      const nestedId = nestedRecord.id;
      const nestedEmail = nestedRecord.email;
      const nestedName = nestedRecord.name;

      if (
        typeof nestedId === 'string' &&
        typeof nestedEmail === 'string' &&
        typeof nestedName === 'string'
      ) {
        return {
          id: nestedId,
          email: nestedEmail,
          name: nestedName,
        };
      }
    }
  }

  return {
    id: `api-user-${Date.now()}`,
    name: credentials.name,
    email: credentials.email,
  };
}
