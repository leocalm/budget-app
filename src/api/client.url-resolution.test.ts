import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();
const env = import.meta.env as unknown as Record<string, string | undefined>;
const originalApiBasePath = env.VITE_API_BASE_PATH;
const originalApiVersion = env.VITE_API_VERSION;

function createSuccessResponse(body: unknown): Response {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('api client URL resolution', () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    if (originalApiBasePath === undefined) {
      delete env.VITE_API_BASE_PATH;
    } else {
      env.VITE_API_BASE_PATH = originalApiBasePath;
    }

    if (originalApiVersion === undefined) {
      delete env.VITE_API_VERSION;
    } else {
      env.VITE_API_VERSION = originalApiVersion;
    }

    vi.restoreAllMocks();
  });

  it('uses an absolute VITE_API_BASE_PATH without prefixing the current origin', async () => {
    env.VITE_API_BASE_PATH = 'https://api.piggy-pulse.com';
    delete env.VITE_API_VERSION;
    fetchMock.mockResolvedValue(createSuccessResponse({ id: 'user-1' }));

    const { apiGet } = await import('./client');
    await apiGet('/api/users/me');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.piggy-pulse.com/users/me',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('trims trailing slash on absolute VITE_API_BASE_PATH', async () => {
    env.VITE_API_BASE_PATH = 'https://api.piggy-pulse.com/api/';
    delete env.VITE_API_VERSION;
    fetchMock.mockResolvedValue(createSuccessResponse({ id: 'user-1' }));

    const { apiGet } = await import('./client');
    await apiGet('/api/users/me');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.piggy-pulse.com/api/users/me',
      expect.objectContaining({ credentials: 'include' })
    );
  });
});
