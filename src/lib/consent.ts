"use client";

/**
 * Çerez onayı altyapısı.
 *
 * Onay durumu birinci taraf bir çerezde tutulur ve Google Consent Mode v2
 * ile senkronize edilir. Google Analytics (gtag.js) ileride eklendiğinde
 * ekstra bir şey yapmaya gerek kalmaz: sayfa açılışında varsayılanlar
 * "denied" olarak set edilir (bkz. layout'taki inline script), kullanıcı
 * onay verdiğinde `applyConsent` güncellemeyi gönderir.
 */

export type ConsentState = {
  /** Zorunlu çerezler — her zaman açık. */
  necessary: true;
  /** Analitik çerezler (Google Analytics vb.). */
  analytics: boolean;
  /** Pazarlama / hedefleme çerezleri. */
  marketing: boolean;
  /** Onay tarihi (ms). */
  ts: number;
  /** Politika sürümü — artarsa kullanıcıya yeniden sorulur. */
  v: number;
};

export const CONSENT_VERSION = 1;
export const CONSENT_COOKIE = "tt_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 gün

/** Çerez ayarları panelini yeniden açmak için tetiklenen olay. */
export const OPEN_COOKIE_SETTINGS_EVENT = "taytech:cookie-settings";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Kayıtlı onayı okur; yoksa veya sürümü eskiyse null döner. */
export function readConsent(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as ConsentState;
    if (parsed.v !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Onayı çereze yazar ve Consent Mode'u günceller. */
export function saveConsent(opts: { analytics: boolean; marketing: boolean }): ConsentState {
  const state: ConsentState = {
    necessary: true,
    analytics: opts.analytics,
    marketing: opts.marketing,
    ts: Date.now(),
    v: CONSENT_VERSION,
  };
  const value = encodeURIComponent(JSON.stringify(state));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  applyConsent(state);
  return state;
}

/** Google Consent Mode v2 güncellemesini gönderir. */
export function applyConsent(state: ConsentState) {
  window.dataLayer = window.dataLayer || [];
  const gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
  gtag("consent", "update", {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
  });
}

/** Ayarlar panelini (footer'daki linkten) yeniden açar. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
