import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiDelete, apiGet, navigation, toCamelCase, toSnakeCase } from './client';
import { ApiError } from './errors';

const fetchMock = vi.fn();

function createErrorResponse(status: number, body: string) {
  return {
    ok: false,
    status,
    headers: {
      get: vi.fn().mockReturnValue(null),
    },
    text: vi.fn().mockResolvedValue(body),
  };
}

describe('api client error handling', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws ApiError with parsed JSON data', async () => {
    const body = JSON.stringify({ message: 'Bad request', error_code: 'bad_request' });
    fetchMock.mockResolvedValue(createErrorResponse(400, body) as unknown as Response);

    try {
      await apiGet('/api/test');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.status).toBe(400);
      expect(apiError.url).toBe('/api/test');
      expect(apiError.message).toBe('Bad request');
      expect(apiError.data).toEqual({ message: 'Bad request', errorCode: 'bad_request' });
      return;
    }

    throw new Error('Expected apiGet to throw ApiError');
  });

  it('falls back to text when error body is not JSON', async () => {
    fetchMock.mockResolvedValue(createErrorResponse(500, 'Server exploded') as unknown as Response);

    try {
      await apiGet('/api/test');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.status).toBe(500);
      expect(apiError.message).toBe('Server exploded');
      expect(apiError.data).toBe('Server exploded');
      return;
    }

    throw new Error('Expected apiGet to throw ApiError');
  });

  it('clears stored auth and redirects on 401', async () => {
    localStorage.setItem('user', 'test-user');
    sessionStorage.setItem('user', 'test-user');

    window.history.pushState({}, '', '/dashboard');
    const assignSpy = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      createErrorResponse(401, JSON.stringify({ message: 'Unauthorized' })) as unknown as Response
    );

    await expect(apiGet('/api/test')).rejects.toBeInstanceOf(ApiError);

    expect(localStorage.getItem('user')).toBeNull();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(assignSpy).toHaveBeenCalledWith('/auth/login');
  });

  it('does not redirect when already on auth routes', async () => {
    window.history.pushState({}, '', '/auth/login');

    const assignSpy = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      createErrorResponse(401, JSON.stringify({ message: 'Unauthorized' })) as unknown as Response
    );

    await expect(apiGet('/api/test')).rejects.toBeInstanceOf(ApiError);

    expect(assignSpy).not.toHaveBeenCalled();
  });

  it('does not redirect for failed login requests', async () => {
    window.history.pushState({}, '', '/dashboard');

    const assignSpy = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      createErrorResponse(401, JSON.stringify({ message: 'Unauthorized' })) as unknown as Response
    );

    await expect(apiGet('/api/users/login')).rejects.toBeInstanceOf(ApiError);

    expect(assignSpy).not.toHaveBeenCalled();
  });
});

describe('api client case transformations', () => {
  it('converts nested snake_case data to camelCase', () => {
    const input = {
      user_id: 'user-1',
      account_balance: 500,
      nested_value: {
        account_id: 'account-1',
        tags: [{ tag_id: 'tag-1' }, { tag_id: 'tag-2' }],
      },
      alreadyCamel: 'kept',
      nullable_value: null,
    };

    const result = toCamelCase<typeof input>(input);

    expect(result).toEqual({
      userId: 'user-1',
      accountBalance: 500,
      nestedValue: {
        accountId: 'account-1',
        tags: [{ tagId: 'tag-1' }, { tagId: 'tag-2' }],
      },
      alreadyCamel: 'kept',
      nullableValue: null,
    });
  });

  it('converts nested camelCase data to snake_case', () => {
    const input = {
      userId: 'user-1',
      accountBalance: 500,
      nestedValue: {
        accountId: 'account-1',
        tags: [{ tagId: 'tag-1' }, { tagId: 'tag-2' }],
      },
      already_snake: 'kept',
      nullableValue: null,
    };

    const result = toSnakeCase<typeof input>(input);

    expect(result).toEqual({
      user_id: 'user-1',
      account_balance: 500,
      nested_value: {
        account_id: 'account-1',
        tags: [{ tag_id: 'tag-1' }, { tag_id: 'tag-2' }],
      },
      already_snake: 'kept',
      nullable_value: null,
    });
  });

  it('handles top-level arrays', () => {
    const input = [{ user_id: '1' }, { user_id: '2' }];
    const result = toCamelCase<typeof input>(input);

    expect(result).toEqual([{ userId: '1' }, { userId: '2' }]);
  });

  it('returns primitives and nullish values unchanged', () => {
    expect(toCamelCase<string>('plain')).toBe('plain');
    expect(toCamelCase<number>(42)).toBe(42);
    expect(toCamelCase<null>(null)).toBeNull();
    expect(toCamelCase<undefined>(undefined)).toBeUndefined();

    expect(toSnakeCase<string>('plain')).toBe('plain');
    expect(toSnakeCase<number>(42)).toBe(42);
    expect(toSnakeCase<null>(null)).toBeNull();
    expect(toSnakeCase<undefined>(undefined)).toBeUndefined();
  });
});

describe('api client delete requests', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  it('sends optional delete body using snake_case keys', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    } as unknown as Response);

    await apiDelete('/api/two-factor/disable', { twoFactorCode: '123456' });

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/two-factor/disable', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ two_factor_code: '123456' }),
      credentials: 'include',
    });
  });
});
