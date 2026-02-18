import { apiPost } from './client';
import { ApiError } from './errors';

const withCause = (message: string, cause: unknown) => {
  return new Error(message, {
    cause: cause instanceof Error ? cause : undefined,
  });
};

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
        throw withCause('Too many password reset attempts. Please try again later.', error);
      }

      if (error.status >= 500) {
        throw withCause('Server error. Please try again later.', error);
      }

      if (error.message) {
        throw withCause(error.message, error);
      }
    }

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw withCause(
        'Unable to connect to the server. Please check your internet connection.',
        error
      );
    }

    throw withCause('Password reset request failed. Please try again.', error);
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
        throw withCause('Invalid or expired reset token.', error);
      }

      if (error.status >= 500) {
        throw withCause('Server error. Please try again later.', error);
      }

      if (error.message) {
        throw withCause(error.message, error);
      }
    }

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw withCause(
        'Unable to connect to the server. Please check your internet connection.',
        error
      );
    }

    throw withCause('Token validation failed. Please try again.', error);
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
        throw withCause(
          error.message || 'Invalid or expired reset token. Please request a new one.',
          error
        );
      }

      if (error.status === 429) {
        throw withCause('Too many attempts. Please try again later.', error);
      }

      if (error.status >= 500) {
        throw withCause('Server error. Please try again later.', error);
      }

      if (error.message) {
        throw withCause(error.message, error);
      }
    }

    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw withCause(
        'Unable to connect to the server. Please check your internet connection.',
        error
      );
    }

    throw withCause('Password reset failed. Please try again.', error);
  }
}
