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

  it('appends VITE_API_VERSION to VITE_API_BASE_PATH when base path has no version', async () => {
    env.VITE_API_BASE_PATH = 'https://api.piggy-pulse.com/api';
    env.VITE_API_VERSION = '2';
    fetchMock.mockResolvedValue(createSuccessResponse({ id: 'user-1' }));

    const { apiGet } = await import('./client');
    await apiGet('/api/users/me');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.piggy-pulse.com/api/v2/users/me',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('does not append VITE_API_VERSION when VITE_API_BASE_PATH is already versioned', async () => {
    env.VITE_API_BASE_PATH = 'https://api.piggy-pulse.com/api/v3';
    env.VITE_API_VERSION = '2';
    fetchMock.mockResolvedValue(createSuccessResponse({ id: 'user-1' }));

    const { apiGet } = await import('./client');
    await apiGet('/api/users/me');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.piggy-pulse.com/api/v3/users/me',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('preserves query string when requesting the /api root path', async () => {
    delete env.VITE_API_BASE_PATH;
    delete env.VITE_API_VERSION;
    fetchMock.mockResolvedValue(createSuccessResponse({ ok: true }));

    const { apiGet } = await import('./client');
    await apiGet('/api?check=true');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1?check=true',
      expect.objectContaining({ credentials: 'include' })
    );
  });
});
