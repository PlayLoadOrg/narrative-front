// src/hooks/useTranslation.ts

import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Wrapper hook for i18next translation
 * Provides type-safe access to translations
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  
  return {
    t,
    language: i18n.language,
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
  };
}