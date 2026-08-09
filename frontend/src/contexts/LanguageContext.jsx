import { createContext, useContext, useEffect, useState } from 'react';
import TRANSLATIONS from '../i18n/translations.js';

const LanguageContext = createContext();

const STORAGE_KEY = 'mzg-language';
const DEFAULT_LANG = 'it';

const LANGUAGES = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LANG;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let value = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to default language
        let fallback = TRANSLATIONS[DEFAULT_LANG];
        for (const k of keys) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = fallback[k];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback: return a passthrough t() if not inside provider
    return { t: (path) => path, lang: DEFAULT_LANG, setLang: () => {}, LANGUAGES };
  }
  return ctx;
};

export { LanguageContext, LANGUAGES, DEFAULT_LANG };