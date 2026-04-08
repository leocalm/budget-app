/**
 * Centralized React Query key management
 * Single source of truth for all query keys used across the application
 */

export const queryKeys = {
  // Settings
  settings: () => ['settings'] as const,
  settingsProfile: () => ['settings', 'profile'] as const,
  settingsPreferences: () => ['settings', 'preferences'] as const,
  settingsSessions: () => ['settings', 'sessions'] as const,
  settingsPeriodModel: () => ['settings', 'period-model'] as const,

  // Currencies
  currencies: () => ['currencies'] as const,
};

export type QueryKey = readonly (string | number | undefined | null)[];
