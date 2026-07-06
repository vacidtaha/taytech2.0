"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { contactTranslations, type Locale } from "../locales/contact";
import {
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  localeCookieOptions,
} from "@/lib/locale";
import { faqTranslations } from "../locales/faq";
import { corporateTranslations } from "../locales/corporate";
import { solutionsTranslations } from "../locales/solutions";
import { homeTranslations } from "../locales/home";
import { productTranslations } from "../locales/product";
import { videoTranslations } from "../locales/video";

const translations: Record<Locale, Record<string, string>> = {
  TR: { ...contactTranslations.TR, ...faqTranslations.TR, ...corporateTranslations.TR, ...solutionsTranslations.TR, ...homeTranslations.TR, ...productTranslations.TR, ...videoTranslations.TR },
  EN: { ...contactTranslations.EN, ...faqTranslations.EN, ...corporateTranslations.EN, ...solutionsTranslations.EN, ...homeTranslations.EN, ...productTranslations.EN, ...videoTranslations.EN },
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "TR",
  setLocale: () => {},
  t: (key) => key,
});

const LOCALE_KEY = "taytech-locale";

function writeLocaleCookies(locale: Locale) {
  const opts = localeCookieOptions();
  const parts = [`path=${opts.path}`, `max-age=${opts.maxAge}`, "SameSite=Lax"];
  document.cookie = `${LOCALE_COOKIE}=${locale}; ${parts.join("; ")}`;
  document.cookie = `${LOCALE_MANUAL_COOKIE}=1; ${parts.join("; ")}`;
}

export function LanguageProvider({
  children,
  initialLocale = "TR",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // Kayıtlı tercihi yükle. İlk render initialLocale ile uyuşsun (hydration).
  useEffect(() => {
    try {
      const manual = document.cookie.includes(`${LOCALE_MANUAL_COOKIE}=1`);
      const saved = localStorage.getItem(LOCALE_KEY);
      if (manual && (saved === "EN" || saved === "TR")) {
        setLocaleState(saved);
        return;
      }
      localStorage.setItem(LOCALE_KEY, initialLocale);
      setLocaleState(initialLocale);
    } catch {
      /* localStorage kapalı olabilir */
    }
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_KEY, next);
      writeLocaleCookies(next);
    } catch {
      /* önemsiz */
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      return (
        translations[locale]?.[key] ??
        translations["TR"]?.[key] ??
        key
      );
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
