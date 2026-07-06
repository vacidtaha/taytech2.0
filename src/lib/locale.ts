import type { NextRequest } from "next/server";
import type { Locale } from "@/app/locales/contact";

export type { Locale };

export const LOCALE_COOKIE = "taytech-locale";
/** Kullanıcı header'dan dil seçtiyse geo ile üzerine yazılmasın. */
export const LOCALE_MANUAL_COOKIE = "taytech-locale-manual";

export function parseLocale(value: string | undefined | null): Locale | null {
  if (value === "TR" || value === "EN") return value;
  return null;
}

/** Ülke kodundan dil (TR → Türkçe, GB/UK → İngilizce). */
export function countryToLocale(country: string | null | undefined): Locale | null {
  if (!country) return null;
  const code = country.trim().toUpperCase();
  if (code === "TR") return "TR";
  if (code === "GB" || code === "UK") return "EN";
  return null;
}

/** Tarayıcı dil başlığı yedek çözüm. */
export function acceptLanguageToLocale(
  acceptLanguage: string | null | undefined
): Locale | null {
  if (!acceptLanguage) return null;
  const primary = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  if (!primary) return null;
  if (primary.startsWith("tr")) return "TR";
  if (primary.startsWith("en")) return "EN";
  return null;
}

/** Cloudflare, Vercel veya Nginx GeoIP başlıkları. */
export function getCountryFromRequest(req: NextRequest): string | null {
  return (
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-country-code") ||
    req.headers.get("x-geo-country") ||
    null
  );
}

export function detectLocaleFromRequest(req: NextRequest): Locale {
  return (
    countryToLocale(getCountryFromRequest(req)) ??
    acceptLanguageToLocale(req.headers.get("accept-language")) ??
    "TR"
  );
}

export function localeCookieOptions(maxAge = 60 * 60 * 24 * 365) {
  return {
    path: "/",
    maxAge,
    sameSite: "lax" as const,
  };
}
