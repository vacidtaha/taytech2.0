"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  applyConsent,
  readConsent,
  saveConsent,
} from "@/lib/consent";

type Category = {
  key: "necessary" | "analytics" | "marketing";
  locked?: boolean;
  title: { tr: string; en: string };
  desc: { tr: string; en: string };
};

const CATEGORIES: Category[] = [
  {
    key: "necessary",
    locked: true,
    title: { tr: "Zorunlu Çerezler", en: "Strictly Necessary" },
    desc: {
      tr: "Oturum, dil tercihi ve güvenlik gibi sitenin çalışması için gerekli çerezler. Devre dışı bırakılamaz.",
      en: "Required for core site functions such as sessions, language preference and security. Cannot be disabled.",
    },
  },
  {
    key: "analytics",
    title: { tr: "Analitik Çerezler", en: "Analytics" },
    desc: {
      tr: "Ziyaret istatistikleri ve site performansını ölçmemize yarayan çerezler (ör. Google Analytics).",
      en: "Help us measure traffic and site performance (e.g. Google Analytics).",
    },
  },
  {
    key: "marketing",
    title: { tr: "Pazarlama Çerezleri", en: "Marketing" },
    desc: {
      tr: "İlgi alanlarınıza uygun içerik ve kampanyaların gösterilmesi için kullanılan çerezler.",
      en: "Used to show content and campaigns relevant to your interests.",
    },
  },
];

/**
 * Çerez onay kutusu — ilk ziyarette sol altta belirir. Onay durumu
 * birinci taraf çerezde saklanır ve Google Consent Mode v2'ye iletilir.
 * Footer'daki "Çerez Ayarları" linkiyle yeniden açılabilir.
 */
export default function CookieConsent() {
  const { locale } = useLanguage();
  const pathname = usePathname();
  const isEn = locale === "EN";

  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    if (saved) {
      // Consent Mode'u sayfa açılışında kayıtlı tercihle senkronla.
      applyConsent(saved);
    } else {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const onOpen = () => {
      const saved = readConsent();
      setAnalytics(saved?.analytics ?? false);
      setMarketing(saved?.marketing ?? false);
      setDetail(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpen);
  }, []);

  if (pathname.startsWith("/yonetim") || pathname.startsWith("/giris")) return null;
  if (!visible) return null;

  const close = () => {
    setVisible(false);
    setDetail(false);
  };

  const decide = (a: boolean, m: boolean) => {
    saveConsent({ analytics: a, marketing: m });
    close();
  };

  const btnPrimary =
    "h-10 rounded-full bg-[#dc2626] px-5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#b91c1c]";
  const btnSecondary =
    "h-10 rounded-full border border-[#d2d2d7] bg-white px-5 text-[13.5px] font-semibold text-[#1d1d1f] transition-colors hover:border-[#1d1d1f]";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={isEn ? "Cookie preferences" : "Çerez tercihleri"}
      className="fixed bottom-4 left-4 right-4 z-30 sm:right-auto sm:w-[420px]"
      style={{ animation: "tt-cookie-in 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <style>{`@keyframes tt-cookie-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        {/* Üst şerit */}
        <div className="h-1 w-full bg-gradient-to-r from-[#dc2626] to-[#991b1b]" />

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#dc2626]">
                Taytech
              </p>
              <h2 className="mt-1 text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
                {isEn ? "We value your privacy" : "Gizliliğinize önem veriyoruz"}
              </h2>
            </div>
            {detail && (
              <button
                type="button"
                onClick={() => setDetail(false)}
                aria-label={isEn ? "Back" : "Geri"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#86868b] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {!detail ? (
            <>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#6e6e73]">
                {isEn
                  ? "We use cookies to run our site, measure performance and improve your experience. You can accept all cookies, allow only the necessary ones, or manage your preferences."
                  : "Sitemizi çalıştırmak, performansı ölçmek ve deneyiminizi iyileştirmek için çerezler kullanıyoruz. Tümünü kabul edebilir, yalnızca zorunlu olanlara izin verebilir veya tercihlerinizi yönetebilirsiniz."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => decide(true, true)} className={btnPrimary}>
                  {isEn ? "Accept all" : "Tümünü Kabul Et"}
                </button>
                <button type="button" onClick={() => decide(false, false)} className={btnSecondary}>
                  {isEn ? "Necessary only" : "Yalnızca Zorunlu"}
                </button>
                <button
                  type="button"
                  onClick={() => setDetail(true)}
                  className="h-10 px-2 text-[13.5px] font-semibold text-[#6e6e73] underline underline-offset-4 transition-colors hover:text-[#1d1d1f]"
                >
                  {isEn ? "Customise" : "Ayarlar"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 space-y-1">
                {CATEGORIES.map((cat) => {
                  const on =
                    cat.key === "necessary"
                      ? true
                      : cat.key === "analytics"
                        ? analytics
                        : marketing;
                  const toggle = () => {
                    if (cat.key === "analytics") setAnalytics((v) => !v);
                    if (cat.key === "marketing") setMarketing((v) => !v);
                  };
                  return (
                    <div
                      key={cat.key}
                      className="flex items-start justify-between gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-[#fafafa]"
                    >
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#1d1d1f]">
                          {isEn ? cat.title.en : cat.title.tr}
                          {cat.locked && (
                            <span className="ml-2 align-middle text-[10.5px] font-semibold uppercase tracking-wide text-[#86868b]">
                              {isEn ? "Always on" : "Her zaman açık"}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#86868b]">
                          {isEn ? cat.desc.en : cat.desc.tr}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        disabled={cat.locked}
                        onClick={toggle}
                        className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors ${
                          on ? "bg-[#dc2626]" : "bg-[#d2d2d7]"
                        } ${cat.locked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <span
                          className={`pointer-events-none absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out ${
                            on ? "translate-x-[18px]" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => decide(analytics, marketing)}
                  className={btnPrimary}
                >
                  {isEn ? "Save preferences" : "Seçimi Kaydet"}
                </button>
                <button type="button" onClick={() => decide(true, true)} className={btnSecondary}>
                  {isEn ? "Accept all" : "Tümünü Kabul Et"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
