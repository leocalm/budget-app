import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { applyDayjsLocale } from '@/lib/locale';
import deDE from './locales/v2/de-de.json';
import en from './locales/v2/en.json';
import esES from './locales/v2/es-es.json';
import frFR from './locales/v2/fr-fr.json';
import nlNL from './locales/v2/nl-nl.json';
import ptPT from './locales/v2/pt-pt.json';
import pt from './locales/v2/pt.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { v2: en },
    pt: { v2: pt },
    'pt-pt': { v2: ptPT },
    'nl-nl': { v2: nlNL },
    'de-de': { v2: deDE },
    'fr-fr': { v2: frFR },
    'es-es': { v2: esES },
  },
  ns: ['v2'],
  defaultNS: 'v2',
  lng: 'en',
  fallbackLng: {
    'pt-pt': ['pt', 'en'],
    default: ['en'],
  },
  interpolation: {
    escapeValue: false,
  },
});

applyDayjsLocale(i18n.language);
i18n.on('languageChanged', applyDayjsLocale);

export default i18n;
