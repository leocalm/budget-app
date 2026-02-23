import {
  ChangePasswordRequest,
  PeriodModelRequest,
  PeriodModelResponse,
  PreferencesRequest,
  PreferencesResponse,
  ProfileRequest,
  ProfileResponse,
  SessionItem,
  SettingsRequest,
  SettingsResponse,
} from '@/types/settings';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

// Legacy settings (for language)
export async function fetchSettings(): Promise<SettingsResponse> {
  return apiGet<SettingsResponse>('/api/settings');
}

export async function updateSettings(payload: SettingsRequest): Promise<SettingsResponse> {
  return apiPut<SettingsResponse, SettingsRequest>('/api/settings', payload);
}

// Profile
export async function fetchProfile(): Promise<ProfileResponse> {
  return apiGet<ProfileResponse>('/api/settings/profile');
}

export async function updateProfile(payload: ProfileRequest): Promise<ProfileResponse> {
  return apiPut<ProfileResponse, ProfileRequest>('/api/settings/profile', payload);
}

// Preferences
export async function fetchPreferences(): Promise<PreferencesResponse> {
  return apiGet<PreferencesResponse>('/api/settings/preferences');
}

export async function updatePreferences(payload: PreferencesRequest): Promise<PreferencesResponse> {
  return apiPut<PreferencesResponse, PreferencesRequest>('/api/settings/preferences', payload);
}

// Security - Password
export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  return apiPost<void, ChangePasswordRequest>('/api/settings/security/password', payload);
}

// Security - Sessions
export async function fetchSessions(): Promise<SessionItem[]> {
  return apiGet<SessionItem[]>('/api/settings/security/sessions');
}

export async function revokeSession(sessionId: string): Promise<void> {
  return apiDelete<void>(`/api/settings/security/sessions/${sessionId}`);
}

// Period Model
export async function fetchPeriodModel(): Promise<PeriodModelResponse> {
  return apiGet<PeriodModelResponse>('/api/settings/period-model');
}

export async function updatePeriodModel(payload: PeriodModelRequest): Promise<PeriodModelResponse> {
  return apiPut<PeriodModelResponse, PeriodModelRequest>('/api/settings/period-model', payload);
}

// Danger Zone
export async function resetStructure(): Promise<void> {
  return apiPost<void, { confirmation: string }>('/api/settings/danger/reset-structure', {
    confirmation: 'RESET',
  });
}

export async function deleteAccount(): Promise<void> {
  return apiPost<void, { confirmation: string }>('/api/settings/danger/delete-account', {
    confirmation: 'DELETE',
  });
}
