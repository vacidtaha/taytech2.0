"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

/** Ana sayfa hero — tek statik görsel (eski slayt sistemi kaldırıldı). */
export default function HomeHero() {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ===== MOBİL =====
  if (isMobile) {
    return (
      <section id="home-hero" className="relative w-full overflow-hidden bg-[#f5f5f7]">
        <div className="relative h-[56vh] w-full">
          <Image
            src="/taytechdiscekim.webp"
            alt={t("home.hero.title")}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
            <p className="text-5xl font-bold tracking-tight text-white">
              {t("home.hero.title")}
            </p>
            {t("home.hero.subtitle") && (
              <p className="text-base font-bold tracking-tight text-white/80 mt-2">
                {t("home.hero.subtitle")}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ===== MASAÜSTÜ =====
  return (
    <section
      id="home-hero"
      className="relative w-full bg-[#f5f5f7] overflow-hidden"
      style={{ height: "100vh" }}
    >
      <div className="relative h-full">
        <Image
          src="/taytechdiscekim.webp"
          alt={t("home.hero.title")}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          <p className="text-9xl font-bold tracking-tight text-white">
            {t("home.hero.title")}
          </p>
          {t("home.hero.subtitle") && (
            <p
              className="text-5xl font-bold tracking-tight text-white absolute"
              style={{ marginTop: "180px" }}
            >
              {t("home.hero.subtitle")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
