export type Theme = 'light' | 'dark' | 'auto';

export type Language = 'en' | 'pt';

export const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
  en: 'English',
  pt: 'Portuguese',
};

export interface SettingsResponse {
  id: string;
  theme: Theme;
  language: Language;
  defaultCurrencyId: string | null;
  budgetStabilityToleranceBasisPoints: number;
  updatedAt: string;
}

export interface SettingsRequest {
  theme: Theme;
  language: Language;
  defaultCurrencyId?: string | null;
  budgetStabilityToleranceBasisPoints?: number;
}
