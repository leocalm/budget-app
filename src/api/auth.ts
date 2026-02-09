import { apiGet, apiPost } from './client';
import { ApiError } from './errors';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Authenticates a user with email and password.
 * Backend returns a cookie that is automatically stored and sent with subsequent requests.
 * @throws Error with user-friendly message on failure
 */
export async function login(credentials: LoginRequest): Promise<void> {
  try {
    await apiPost<void, LoginRequest>('/api/users/login', credentials);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isUnauthorized) {
        throw new Error('Invalid email or password. Please try again.');
      }

      if (error.status === 429) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (error.message) {
        throw new Error(error.message);
      }
    }

    // Extract meaningful error messages from API response
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }

      if (error.message.trim().length > 0) {
        throw new Error(error.message);
      }
    }

    // Generic error fallback
    throw new Error('Login failed. Please try again.');
  }
}

/**
 * Fetches the current authenticated user from the backend using the auth cookie.
 * Expected response shapes:
 * - { user: { ... } }
 * - { data: { user: { ... } } }
 * - { ...user fields... }
 */
export async function fetchCurrentUser(): Promise<User> {
  const response = await apiGet<User | { user: User }>('/api/users/me');
  if (response && typeof response === 'object' && 'user' in response) {
    return response.user;
  }
  return response as User;
}

/**
 * Registers a new user with name, email, and password.
 * Backend returns a cookie that is automatically stored and sent with subsequent requests.
 * @throws Error with user-friendly message on failure
 */
export async function register(credentials: RegisterRequest): Promise<void> {
  try {
    await apiPost<void, RegisterRequest>('/api/users/register', credentials);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        throw new Error('This email is already registered. Please use a different email.');
      }

      if (error.status === 400) {
        throw new Error(error.message || 'Invalid registration data. Please check your inputs.');
      }

      if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (error.message) {
        throw new Error(error.message);
      }
    }

    // Extract meaningful error messages from API response
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
      }

      if (error.message.trim().length > 0) {
        throw new Error(error.message);
      }
    }

    // Generic error fallback
    throw new Error('Registration failed. Please try again.');
  }
}

/**
 * Logs out the current user.
 * Clears the authentication cookie on the backend.
 */
export async function logout(): Promise<void> {
  try {
    await apiPost('/api/users/logout');
  } catch (error) {
    // Logout should be silent - even if it fails on the server,
    // we still want to clear client-side auth state
  }
}
