import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import pt from './locales/pt.json';
import v2En from './locales/v2/en.json';
import v2Pt from './locales/v2/pt.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, v2: v2En },
    pt: { translation: pt, v2: v2Pt },
  },
  ns: ['translation', 'v2'],
  defaultNS: 'translation',
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
