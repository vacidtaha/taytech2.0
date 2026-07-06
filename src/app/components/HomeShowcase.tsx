"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { ShowcaseProduct } from "@/lib/catalog";

/**
 * Ana sayfa ürün vitrini (Isı İstasyonu, Smart Serisi vb.).
 * Video bölümün tamamını arka plan olarak kaplar; videoSide'a göre sağa ya da
 * sola yaslanır, karşı tarafta beyaza yumuşayan bir alan üzerinde
 * başlık/açıklama/buton durur. Altında Apple tarzı, kullanıcı tarafından
 * kaydırılan ürün kartları bulunur.
 */
export default function HomeShowcase({
  videoSrc,
  videoSide = "right",
  titleKey,
  descKey,
  btnKey,
  href,
  products = [],
}: {
  videoSrc: string;
  videoSide?: "left" | "right";
  titleKey: string;
  descKey: string;
  btnKey: string;
  href: string;
  products?: ShowcaseProduct[];
}) {
  const { t, locale } = useLanguage();
  const isEn = locale === "EN";
  const videoLeft = videoSide === "left";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  function scrollByDir(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.75), behavior: "smooth" });
  }

  return (
    <div
      className="relative overflow-hidden bg-white mx-[8px] lg:mx-[13px]"
      style={{ marginTop: "13px" }}
    >
      {/* Üst blok: video + metin (mobilde alt alta, geniş ekranda video arka plan) */}
      <div className="relative flex flex-col lg:block">
        {/* Video: mobilde gizli, lg'de bölümün arka planı */}
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={t(titleKey)}
          className={`hidden lg:absolute lg:inset-0 lg:block lg:h-full lg:w-full lg:object-contain ${
            videoLeft ? "lg:object-left" : "lg:object-right"
          }`}
        />

        {/* Videonun karşısından beyaza yumuşayan katman — yalnızca geniş ekranda */}
        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block"
          style={{
            background: `linear-gradient(to ${videoLeft ? "left" : "right"}, #ffffff 0%, #ffffff 22%, rgba(255,255,255,0.88) 38%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 72%)`,
          }}
        />

        {/* İçerik — mobilde videonun üstünde (akışta ilk), lg'de videonun karşı tarafında */}
        <div
          className={`relative z-10 order-first flex items-center px-7 pb-8 pt-10 lg:min-h-[760px] lg:px-7 lg:py-8 ${
            videoLeft ? "lg:justify-end" : ""
          }`}
        >
          <div
            className={`w-full max-w-[520px] ${
              videoLeft ? "lg:!mr-[100px]" : "lg:!ml-[100px]"
            }`}
          >
            <h2
              className="mb-4 text-[26px] font-bold leading-tight lg:text-[48px]"
              style={{ color: "#1d1d1f" }}
            >
              {t(titleKey)}
            </h2>
            <p
              className="mb-8 text-[14px] leading-relaxed lg:text-[18px]"
              style={{ color: "#4b4b4f", fontWeight: 450 }}
            >
              {t(descKey)}
            </p>
            <Link
              href={href}
              className="inline-flex items-center gap-[10px] whitespace-nowrap rounded-full bg-[#dc2626] px-[22px] py-[12px] text-[15px] font-semibold text-white transition-all hover:bg-[#b91c1c] lg:text-[17px]"
            >
              {t(btnKey)}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Alt blok: ilgili ürünler — Apple tarzı kaydırılabilir kartlar */}
      {products.length > 0 && (
        <div className="relative border-t border-[#f0f0f0] pb-6 pt-7 lg:pb-8 lg:pt-9">
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="no-scrollbar flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-[44px] scroll-pl-[44px] lg:gap-5 lg:px-[140px] lg:scroll-pl-[140px]"
          >
            {products.map((p) => {
              const img = isEn ? p.imageEn ?? p.imageTr : p.imageTr ?? p.imageEn;
              const name = isEn ? p.nameEn : p.nameTr;
              const excerpt = isEn
                ? p.excerptEn ?? p.excerptTr
                : p.excerptTr ?? p.excerptEn;
              return (
                <Link
                  key={p.slug}
                  href={`/urun/${p.slug}`}
                  className="group flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-[#f5f5f7] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] lg:w-[290px]"
                >
                  {/* Görsel alanı */}
                  <div className="relative mx-6 mt-7 h-[150px] overflow-hidden lg:h-[180px]">
                    {img ? (
                      <Image
                        src={img}
                        alt={name}
                        fill
                        sizes="290px"
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl font-semibold text-[#d2d2d7]">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Metin alanı */}
                  <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                    <h3 className="text-[17px] font-semibold leading-snug text-[#1d1d1f]">
                      {name}
                    </h3>
                    {excerpt && (
                      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#6e6e73]">
                        {excerpt}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-medium text-[#dc2626]">
                      {isEn ? "Explore" : "İncele"}
                      <ChevronRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Ok butonları (Apple tarzı) */}
          <div className="mt-5 flex justify-end gap-3 px-[44px] lg:px-[140px]">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              disabled={!canLeft}
              aria-label={isEn ? "Scroll left" : "Sola kaydır"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-all hover:bg-[#dcdce1] disabled:opacity-35"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              disabled={!canRight}
              aria-label={isEn ? "Scroll right" : "Sağa kaydır"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-all hover:bg-[#dcdce1] disabled:opacity-35"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
