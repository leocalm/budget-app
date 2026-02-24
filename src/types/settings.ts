export type Theme = 'light' | 'dark' | 'auto';

export type Language = 'en' | 'pt';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export type NumberFormat = '1,234.56' | '1.234,56' | '1 234.56';

export type PeriodMode = 'automatic' | 'manual';

export type WeekendAdjustment = 'keep' | 'friday' | 'monday';

export const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
  en: 'English',
  pt: 'Portuguese',
};

// Legacy settings (kept for language support)
export interface SettingsResponse {
  id: string;
  theme: Theme;
  language: Language;
  defaultCurrencyId: string | null;
  budgetStabilityToleranceBasisPoints: number;
  updatedAt: string;
}

export interface SettingsRequest {
  theme?: Theme;
  language?: Language;
  defaultCurrencyId?: string | null;
  budgetStabilityToleranceBasisPoints?: number;
}

// Profile
export interface ProfileResponse {
  name: string;
  email: string;
  timezone: string;
  defaultCurrencyId: string | null;
}

export interface ProfileRequest {
  name: string;
  timezone: string;
  defaultCurrencyId?: string | null;
}

// Preferences
export interface PreferencesResponse {
  theme: Theme;
  dateFormat: DateFormat;
  numberFormat: NumberFormat;
  compactMode: boolean;
}

export interface PreferencesRequest {
  theme?: Theme;
  dateFormat?: DateFormat;
  numberFormat?: NumberFormat;
  compactMode?: boolean;
}

// Security
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SessionItem {
  id: string;
  deviceLabel: string;
  country: string;
  createdAt: string;
  isCurrent: boolean;
}

// Period Model
export interface PeriodModelSchedule {
  startDay: number;
  durationValue: number;
  durationUnit: string;
  generateAhead: number;
  saturdayAdjustment: WeekendAdjustment;
  sundayAdjustment: WeekendAdjustment;
  namePattern: string;
}

export interface PeriodModelResponse {
  periodMode: PeriodMode;
  periodSchedule: PeriodModelSchedule | null;
}

export interface PeriodModelRequest {
  periodMode: PeriodMode;
  periodSchedule?: PeriodModelSchedule | null;
}
