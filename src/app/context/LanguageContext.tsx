"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { contactTranslations, type Locale } from "../locales/contact";
import {
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  localeCookieOptions,
} from "@/lib/locale";
import { isEnPath, localizePath } from "@/lib/paths";
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
  /** Türkçe yolu aktif dile göre çevirir (EN'de /en/products vb.). */
  lp: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "TR",
  setLocale: () => {},
  t: (key) => key,
  lp: (path) => path,
});

function writeLocaleCookies(locale: Locale) {
  const opts = localeCookieOptions();
  const parts = [`path=${opts.path}`, `max-age=${opts.maxAge}`, "SameSite=Lax"];
  document.cookie = `${LOCALE_COOKIE}=${locale}; ${parts.join("; ")}`;
  document.cookie = `${LOCALE_MANUAL_COOKIE}=1; ${parts.join("; ")}`;
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
  /** Geriye dönük uyumluluk; dil artık URL'den türetilir. */
  initialLocale?: Locale;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Dil artık URL'den belirlenir: /en altındaki her sayfa İngilizcedir.
  const locale: Locale = isEnPath(pathname) ? "EN" : "TR";

  // Dil değişimi = aynı sayfanın diğer dildeki URL'sine geçiş.
  const setLocale = useCallback(
    (next: Locale) => {
      try {
        writeLocaleCookies(next);
      } catch {
        /* önemsiz */
      }
      const target = localizePath(pathname, next);
      if (target !== pathname) router.push(target);
    },
    [pathname, router]
  );

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

  const lp = useCallback(
    (path: string): string => localizePath(path, locale),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, lp }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
