import { apiDelete, apiGet, apiPost } from './client';
import { ApiError } from './errors';

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string; // data URL for QR code image (camelCase from snake_case qr_code)
  backupCodes: string[]; // camelCase from snake_case backup_codes
}

export interface TwoFactorStatus {
  enabled: boolean;
  hasBackupCodes: boolean; // camelCase from snake_case has_backup_codes
  backupCodesRemaining: number; // camelCase from snake_case backup_codes_remaining
}

export interface TwoFactorVerifyRequest {
  code: string;
}

export interface TwoFactorDisableRequest {
  password: string;
  code: string;
}

export interface TwoFactorRegenerateRequest {
  code: string;
}

export interface EmergencyDisableRequest {
  email: string;
}

export interface EmergencyDisableConfirm {
  token: string;
}

/**
 * Initialize 2FA setup - generates secret, QR code, and backup codes
 */
export async function setupTwoFactor(): Promise<TwoFactorSetupResponse> {
  try {
    return await apiPost<TwoFactorSetupResponse>('/api/two-factor/setup');
  } catch (error) {
    if (error instanceof ApiError && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Failed to setup two-factor authentication');
  }
}

/**
 * Verify 2FA code and enable two-factor authentication
 */
export async function verifyTwoFactor(code: string): Promise<void> {
  try {
    await apiPost<void, TwoFactorVerifyRequest>('/api/two-factor/verify', { code });
  } catch (error) {
    if (error instanceof ApiError && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Invalid verification code');
  }
}

/**
 * Disable two-factor authentication (requires password + current 2FA code)
 */
export async function disableTwoFactor(password: string, code: string): Promise<void> {
  try {
    await apiDelete<void, TwoFactorDisableRequest>('/api/two-factor/disable', { password, code });
  } catch (error) {
    if (error instanceof ApiError && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Failed to disable two-factor authentication');
  }
}

/**
 * Get current 2FA status for the authenticated user
 */
export async function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  try {
    return await apiGet<TwoFactorStatus>('/api/two-factor/status');
  } catch (error) {
    if (error instanceof ApiError && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Failed to get two-factor status');
  }
}

/**
 * Regenerate backup codes (requires current 2FA code)
 */
export async function regenerateBackupCodes(code: string): Promise<string[]> {
  try {
    return await apiPost<string[], TwoFactorRegenerateRequest>(
      '/api/two-factor/regenerate-backup-codes',
      { code }
    );
  } catch (error) {
    if (error instanceof ApiError && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Failed to regenerate backup codes');
  }
}

/**
 * Request emergency 2FA disable via email
 */
export async function requestEmergencyDisable(email: string): Promise<void> {
  try {
    await apiPost<void, EmergencyDisableRequest>('/api/two-factor/emergency-disable-request', {
      email,
    });
  } catch (error) {
    if (error instanceof ApiError && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Failed to request emergency disable');
  }
}

/**
 * Confirm emergency 2FA disable with token from email
 */
export async function confirmEmergencyDisable(token: string): Promise<void> {
  try {
    await apiPost<void, EmergencyDisableConfirm>('/api/two-factor/emergency-disable-confirm', {
      token,
    });
  } catch (error) {
    if (error instanceof ApiError && error.message) {
      throw new Error(error.message);
    }
    throw new Error('Invalid or expired token');
  }
}
