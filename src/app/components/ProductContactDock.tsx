"use client";

import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { useLanguage } from "@/app/context/LanguageContext";

const GRADIENT =
  "linear-gradient(to left, #ef4444 0%, #dc2626 35%, #b91c1c 70%, #7f1d1d 100%)";

const COLLAPSE_KEY = "taytech-contact-dock-collapsed";

/* İletişim sayfasındaki formla aynı EmailJS yapılandırması */
const EMAILJS_SERVICE_ID = "service_taytech";
const EMAILJS_TEMPLATE_ID = "template_contact";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

export default function ProductContactDock({
  productSlug,
  productName,
  visible = true,
}: {
  productSlug?: string;
  productName?: string;
  visible?: boolean;
}) {
  const { locale, t } = useLanguage();
  // Varsayılan: kapalı (yuvarlak buton). Kullanıcı açarsa oturum boyunca açık kalır.
  const [collapsed, setCollapsed] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const isEn = locale === "EN";

  const subjectBase =
    productName ??
    (productSlug
      ? productSlug.replace(/-/g, " ")
      : isEn
        ? "Taytech website"
        : "Taytech web sitesi");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(COLLAPSE_KEY) === "0") setCollapsed(false);
    } catch {
      /* sessionStorage kapalı olabilir */
    }
  }, []);

  const setCollapsedPersist = (value: boolean) => {
    setCollapsed(value);
    try {
      sessionStorage.setItem(COLLAPSE_KEY, value ? "1" : "0");
    } catch {
      /* önemsiz */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: email,
          from_email: email,
          phone: "",
          company: "",
          subject: isEn
            ? `Quick contact: ${subjectBase}`
            : `Hızlı iletişim: ${subjectBase}`,
          message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setEmail("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  const showDock = visible && !collapsed;
  const showBubble = visible && collapsed;

  const inputClass =
    "w-full rounded-xl border border-white/40 bg-white px-3.5 py-2.5 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-colors focus:border-white";

  return (
    <>
      {/* Açık kutu */}
      <aside
        aria-label={t("product.dock.title")}
        aria-hidden={!showDock}
        className={`pointer-events-none fixed bottom-6 right-5 z-30 hidden w-[328px] transition-all duration-300 ease-out md:block ${
          showDock
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div
          className="pointer-events-auto overflow-hidden rounded-[20px] shadow-[0_16px_44px_rgba(127,29,29,0.35)]"
          style={{ backgroundImage: GRADIENT }}
        >
          {/* Başlık */}
          <div className="relative border-b border-white/15 px-4 py-3 pr-11">
            <p
              lang={isEn ? "en" : "tr"}
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70"
            >
              {t("product.dock.eyebrow")}
            </p>
            <p className="mt-0.5 text-[14px] font-semibold leading-snug text-white">
              {t("product.dock.title")}
            </p>
            <button
              type="button"
              onClick={() => setCollapsedPersist(true)}
              aria-label={t("product.dock.close")}
              className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* TR: hızlı iletişim bilgileri (EN sayfada gösterilmez) */}
          {!isEn && (
            <div className="flex flex-col border-b border-white/15 p-2">
              <a
                href="tel:+902625025149"
                className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/10"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#b91c1c]">
                  <Phone size={13} className="shrink-0" />
                </span>
                <span className="text-[12.5px] font-medium text-white">
                  {t("contact.phone1")}
                </span>
              </a>
              <a
                href="mailto:info@taytech.com.tr"
                className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/10"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#b91c1c]">
                  <Mail size={13} className="shrink-0" />
                </span>
                <span className="text-[12.5px] font-medium text-white">
                  {t("contact.emailAddr")}
                </span>
              </a>
            </div>
          )}

          {/* Mini form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3">
            {status === "success" ? (
              <p className="rounded-xl bg-white/15 px-3.5 py-3 text-center text-[12.5px] font-medium leading-relaxed text-white">
                {t("product.dock.success")}
              </p>
            ) : (
              <>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("product.dock.emailPh")}
                  className={inputClass}
                />
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("product.dock.msgPh")}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
                {status === "error" && (
                  <p className="text-[11.5px] font-medium text-white/90">
                    {t("product.dock.error")}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-0.5 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#b91c1c] transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "sending"
                    ? t("product.dock.sending")
                    : t("product.dock.send")}
                </button>
              </>
            )}
          </form>
        </div>
      </aside>

      {/* Kapalı durum: sağ altta yuvarlak buton */}
      <button
        type="button"
        onClick={() => setCollapsedPersist(false)}
        aria-label={t("product.dock.open")}
        aria-hidden={!showBubble}
        tabIndex={showBubble ? 0 : -1}
        className={`fixed bottom-6 right-5 z-30 hidden h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_32px_rgba(127,29,29,0.4)] transition-all duration-300 ease-out hover:scale-105 active:scale-95 md:flex ${
          showBubble
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ backgroundImage: GRADIENT }}
      >
        <MessageCircle size={24} className="shrink-0" />
      </button>
    </>
  );
}
