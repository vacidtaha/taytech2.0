"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type Props = {
  image: string;
  nameKey: string;
  descKey: string;
  h2Key: string;
  p1Key: string;
  p2Key: string;
};

export default function SolutionDetail({
  image,
  nameKey,
  descKey,
  h2Key,
  p1Key,
  p2Key,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero - arka planda çözüm fotoğrafı */}
      <section className="relative h-[78vh] min-h-[540px] w-full overflow-hidden">
        <Image
          src={image}
          alt={t(nameKey)}
          fill
          priority
          className="scale-105 object-cover"
        />
        {/* Premium karartma gradyanı */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 42%, rgba(0,0,0,0.12) 75%, rgba(0,0,0,0.25) 100%)",
          }}
        />

        {/* Geri butonu - sol üst köşe, sadece ikon */}
        <div className="absolute left-6 top-6 md:left-8 md:top-8">
          <Link
            href="/cozumler"
            aria-label={t("cozumler.nav")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowLeft size={18} className="shrink-0" />
          </Link>
        </div>

        {/* Başlık bloğu - alt sol */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-6 pb-16 md:pb-24">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] text-white md:text-6xl">
              {t(nameKey)}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              {t(descKey)}
            </p>
          </div>
        </div>
      </section>

      {/* İçerik */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
          <div className="md:sticky md:top-32 md:h-fit">
            <h2 className="text-2xl font-semibold leading-snug text-[#1d1d1f] md:text-4xl">
              {t(h2Key)}
            </h2>
          </div>
          <div className="space-y-7 text-[17px] leading-[1.9] text-[#424245]">
            <p>{t(p1Key)}</p>
            <p>{t(p2Key)}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
