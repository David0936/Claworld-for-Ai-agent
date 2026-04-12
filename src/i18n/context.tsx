"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { LANGUAGES, type LangCode, DEFAULT_LANG, t as translate } from "./translations";

interface I18nContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: Parameters<typeof translate>[0]) => string;
  availableLangs: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextType>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => translate(key, DEFAULT_LANG),
  availableLangs: LANGUAGES,
});

const STORAGE_KEY = "claworld-lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);
  const [mounted, setMounted] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LangCode | null;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLangState(saved);
      }
    } catch {}
    setMounted(true);
  }, []);

  function setLang(newLang: LangCode) {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {}
  }

  function t(key: Parameters<typeof translate>[0]): string {
    return translate(key, lang);
  }

  // Sync document lang with current language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Avoid hydration mismatch: render with default lang until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, availableLangs: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
