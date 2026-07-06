"use client";

import Link from "next/link";
import { Mail, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const GRADIENT =
  "linear-gradient(to left, #ef4444 0%, #dc2626 35%, #b91c1c 70%, #7f1d1d 100%)";

const DISMISS_KEY = "taytech-contact-dock-dismissed";

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
  const [dismissed, setDismissed] = useState(false);
  const isEn = locale === "EN";
  const subjectBase =
    productName ??
    (productSlug
      ? productSlug.replace(/-/g, " ")
      : isEn
        ? "Taytech website"
        : "Taytech web sitesi");
  const mailSubject = encodeURIComponent(
    isEn ? `Inquiry: ${subjectBase}` : `İletişim: ${subjectBase}`
  );

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      /* sessionStorage kapalı olabilir */
    }
  }, []);

  const closeDock = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* önemsiz */
    }
  };

  const items = [
    {
      href: "tel:+902625025149",
      label: t("product.dock.phone"),
      value: t("contact.phone1"),
      Icon: Phone,
      external: true,
    },
    {
      href: `mailto:info@taytech.com.tr?subject=${mailSubject}`,
      label: t("product.dock.email"),
      value: t("contact.emailAddr"),
      Icon: Mail,
      external: true,
    },
    {
      href: "/iletisim",
      label: t("product.dock.form"),
      value: t("product.dock.formHint"),
      Icon: MessageCircle,
      external: false,
    },
  ] as const;

  const show = visible && !dismissed;
  const motionClass = show
    ? "translate-y-0 opacity-100"
    : "pointer-events-none translate-y-4 opacity-0";

  return (
    <aside
      aria-label={t("product.dock.title")}
      aria-hidden={!show}
      className={`pointer-events-none fixed bottom-8 right-6 z-30 hidden w-[min(100%,320px)] transition-all duration-300 ease-out md:block ${motionClass}`}
    >
      <div
        className="pointer-events-auto overflow-hidden rounded-[22px] shadow-[0_18px_50px_rgba(127,29,29,0.35)]"
        style={{ backgroundImage: GRADIENT }}
      >
        <div className="relative border-b border-white/15 px-5 py-4 pr-12">
          <p
            lang={isEn ? "en" : "tr"}
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70"
          >
            {t("product.dock.eyebrow")}
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-snug text-white">
            {t("product.dock.title")}
          </p>
          <button
            type="button"
            onClick={closeDock}
            aria-label={t("product.dock.close")}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {items.map(({ href, label, value, Icon, external }) => {
            const className =
              "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-white/10";
            const inner = (
              <>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#b91c1c]">
                  <Icon size={18} className="shrink-0" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block text-[13px] font-semibold text-white">
                    {label}
                  </span>
                  <span className="block truncate text-[12px] text-white/75">
                    {value}
                  </span>
                </span>
              </>
            );
            return external ? (
              <a key={label} href={href} className={className}>
                {inner}
              </a>
            ) : (
              <Link key={label} href={href} className={className}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
