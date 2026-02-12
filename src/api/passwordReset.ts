import { apiPost } from './client';
import { ApiError } from './errors';

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetValidatePayload {
  token: string;
}

export interface PasswordResetConfirmPayload {
  token: string;
  new_password: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface PasswordResetValidateResponse {
  valid: boolean;
  email?: string;
}

/**
 * Request a password reset email.
 * Always returns success to prevent email enumeration.
 * @throws Error with user-friendly message on failure
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResponse> {
  try {
    return await apiPost<PasswordResetResponse, PasswordResetRequestPayload>(
      '/api/password-reset/request',
      { email }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        throw new Error('Too many password reset attempts. Please try again later.');
      }

      if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (error.message) {
        throw new Error(error.message);
      }
    }

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }

    throw new Error('Password reset request failed. Please try again.');
  }
}

/**
 * Validate a password reset token.
 * @throws Error with user-friendly message on failure
 */
export async function validatePasswordResetToken(
  token: string
): Promise<PasswordResetValidateResponse> {
  try {
    return await apiPost<PasswordResetValidateResponse, PasswordResetValidatePayload>(
      '/api/password-reset/validate',
      { token }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        throw new Error('Invalid or expired reset token.');
      }

      if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (error.message) {
        throw new Error(error.message);
      }
    }

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }

    throw new Error('Token validation failed. Please try again.');
  }
}

/**
 * Confirm password reset with new password.
 * @throws Error with user-friendly message on failure
 */
export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  try {
    await apiPost<void, PasswordResetConfirmPayload>('/api/password-reset/confirm', {
      token,
      new_password: newPassword,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        throw new Error(
          error.message || 'Invalid or expired reset token. Please request a new one.'
        );
      }

      if (error.status === 429) {
        throw new Error('Too many attempts. Please try again later.');
      }

      if (error.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      if (error.message) {
        throw new Error(error.message);
      }
    }

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection.');
    }

    throw new Error('Password reset failed. Please try again.');
  }
}
