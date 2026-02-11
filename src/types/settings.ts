export type Theme = 'light' | 'dark' | 'auto';

export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de';

export const LANGUAGE_DISPLAY_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  de: 'German',
};

export interface SettingsResponse {
  id: string;
  theme: Theme;
  language: Language;
  defaultCurrencyId: string | null;
  updatedAt: string;
}

export interface SettingsRequest {
  theme: Theme;
  language: Language;
  defaultCurrencyId?: string | null;
}
