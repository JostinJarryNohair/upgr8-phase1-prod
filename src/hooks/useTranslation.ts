"use client";

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export function useTranslation() {
  const [mounted, setMounted] = useState(false);
  const translation = useI18nTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a fallback translation function
    return {
      t: (key: string) => key,
      i18n: {
        language: 'fr',
        changeLanguage: () => {},
      },
    };
  }

  return translation;
} 