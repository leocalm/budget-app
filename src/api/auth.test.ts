import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCurrentUser, login, LoginRequest, register, RegisterRequest, User } from './auth';
import { apiGet, apiPost } from './client';
import { AccountLockedError, ApiError, RateLimitError } from './errors';

vi.mock('./client', () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
}));

describe('auth api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('registers a user via /api/users/', async () => {
      const credentials: RegisterRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockResolvedValueOnce(undefined);

      await expect(register(credentials)).resolves.toBeUndefined();
      expect(apiPostMock).toHaveBeenCalledWith('/api/users/', credentials);
    });

    it('throws error when email is already registered (409)', async () => {
      const credentials: RegisterRequest = {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(new ApiError('Conflict', 409, '/api/users/'));

      await expect(register(credentials)).rejects.toThrow(
        'This email is already registered. Please use a different email.'
      );
    });

    it('throws error on invalid registration data (400)', async () => {
      const credentials: RegisterRequest = {
        name: 'John',
        email: 'invalid-email',
        password: 'pass',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(new ApiError('Bad Request', 400, '/api/users/'));

      await expect(register(credentials)).rejects.toThrow('Bad Request');
    });

    it('throws error on server error (500)', async () => {
      const credentials: RegisterRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(new ApiError('Internal Server Error', 500, '/api/users/'));

      await expect(register(credentials)).rejects.toThrow('Server error. Please try again later.');
    });

    it('throws error on network failure', async () => {
      const credentials: RegisterRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(register(credentials)).rejects.toThrow(
        'Unable to connect to the server. Please check your internet connection.'
      );
    });

    it('throws generic error on unknown error', async () => {
      const credentials: RegisterRequest = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(new Error(''));

      await expect(register(credentials)).rejects.toThrow('Registration failed. Please try again.');
    });
  });

  describe('login', () => {
    it('logs in a user via /api/users/login', async () => {
      const credentials: LoginRequest = {
        email: 'john@example.com',
        password: 'password123',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockResolvedValueOnce(undefined);

      await expect(login(credentials)).resolves.toBeUndefined();
      expect(apiPostMock).toHaveBeenCalledWith('/api/users/login', credentials);
    });

    it('throws error on invalid credentials (401)', async () => {
      const credentials: LoginRequest = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(new ApiError('Unauthorized', 401, '/api/users/login'));

      await expect(login(credentials)).rejects.toThrow(
        'Invalid email or password. Please try again.'
      );
    });

    it('throws RateLimitError with retryAfterSeconds on 429', async () => {
      const credentials: LoginRequest = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(
        new ApiError('Too many attempts', 429, '/api/users/login', {
          error: 'too_many_attempts',
          retry_after_seconds: 30,
        })
      );

      const error = await login(credentials).catch((e) => e);
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.retryAfterSeconds).toBe(30);
    });

    it('throws AccountLockedError with lockedUntil on 423', async () => {
      const credentials: LoginRequest = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const lockedUntil = '2026-02-26T10:00:00Z';
      const apiPostMock = vi.mocked(apiPost);
      apiPostMock.mockRejectedValueOnce(
        new ApiError('Account locked', 423, '/api/users/login', {
          error: 'account_locked',
          locked_until: lockedUntil,
        })
      );

      const error = await login(credentials).catch((e) => e);
      expect(error).toBeInstanceOf(AccountLockedError);
      expect(error.lockedUntil).toBe(lockedUntil);
    });
  });

  describe('fetchCurrentUser', () => {
    it('fetches current user via /api/users/me', async () => {
      const user: User = {
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
      };

      const apiGetMock = vi.mocked(apiGet);
      apiGetMock.mockResolvedValueOnce(user);

      await expect(fetchCurrentUser()).resolves.toEqual(user);
      expect(apiGetMock).toHaveBeenCalledWith('/api/users/me');
    });

    it('extracts user from wrapped response', async () => {
      const user: User = {
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
      };

      const apiGetMock = vi.mocked(apiGet);
      apiGetMock.mockResolvedValueOnce({ user });

      await expect(fetchCurrentUser()).resolves.toEqual(user);
    });
  });
});
