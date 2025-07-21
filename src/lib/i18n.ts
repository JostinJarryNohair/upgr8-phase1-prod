import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import frTranslations from '../locales/fr.json';

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  }
};

// Only initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'fr',
      debug: false,
      
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      }
    });
}

export default i18n; 