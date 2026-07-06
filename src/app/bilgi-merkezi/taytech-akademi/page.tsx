"use client";

import { useLanguage } from "@/app/context/LanguageContext";

export default function TaytechAkademiPage() {
  const { t } = useLanguage();

  return (
    <main className="flex-1 bg-white text-[#1d1d1f]">
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-14 text-center md:px-6 md:pb-28 md:pt-24">
        <p className="text-[13px] font-semibold tracking-wide text-[#dc2626] md:text-sm">
          {t("akademi.eyebrow")}
        </p>
        <h1 className="mt-2 text-4xl font-semibold leading-[1.05] tracking-tight md:mt-3 md:text-7xl">
          {t("akademi.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#6e6e73] md:mt-5 md:text-[19px]">
          {t("akademi.desc")}
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl bg-[#f5f5f7] md:mt-16 md:rounded-[28px]">
          <video
            src="/akademi.mp4"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="aspect-video h-auto w-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}
