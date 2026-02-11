import { SettingsRequest, SettingsResponse } from '@/types/settings';
import { apiGet, apiPut } from './client';

export async function fetchSettings(): Promise<SettingsResponse> {
  return apiGet<SettingsResponse>('/api/settings');
}

export async function updateSettings(payload: SettingsRequest): Promise<SettingsResponse> {
  return apiPut<SettingsResponse, SettingsRequest>('/api/settings', payload);
}
