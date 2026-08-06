"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import AmbientGlow from "@/app/components/AmbientGlow";
import type { CategoryCard, ProductCard } from "@/lib/catalog";

type Props = {
  nameTr: string;
  nameEn: string;
  ancestors: { slug: string; nameTr: string; nameEn: string }[];
  subcategories: CategoryCard[];
  products: ProductCard[];
  isRoot?: boolean;
};

export default function CategoryView({
  nameTr,
  nameEn,
  ancestors,
  subcategories,
  products,
  isRoot = false,
}: Props) {
  const { locale, lp } = useLanguage();
  const isEn = locale === "EN";
  const name = isEn ? nameEn : nameTr;

  const isEmpty = subcategories.length === 0 && products.length === 0;

  const backHref = isRoot
    ? "/"
    : ancestors.length > 0
      ? `/urunler/${ancestors[ancestors.length - 1].slug}`
      : "/urunler";

  const backButtonClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#dc2626] bg-[#ececf0] text-[#1d1d1f] transition-colors hover:bg-[#fef2f2]";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-white text-[#1d1d1f]">
      {!isEmpty && <AmbientGlow />}
      <div className="relative mx-auto max-w-6xl px-5 pt-7 md:px-6 md:pt-14">
        <Link
          href={lp(backHref)}
          aria-label={isEn ? "Back" : "Geri"}
          className={`absolute left-5 top-7 md:left-6 md:top-14 ${backButtonClass}`}
        >
          <ArrowLeft size={19} />
        </Link>
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 pl-12 text-[13px] text-[#86868b] md:pl-14">
          <Link href={lp("/urunler")} className="transition-colors hover:text-[#1d1d1f]">
            {isEn ? "Products" : "Ürünler"}
          </Link>
          {ancestors.map((a) => (
            <span key={a.slug} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="shrink-0" />
              <Link
                href={lp(`/urunler/${a.slug}`)}
                className="transition-colors hover:text-[#1d1d1f]"
              >
                {isEn ? a.nameEn : a.nameTr}
              </Link>
            </span>
          ))}
          {!isRoot && (
            <>
              <ChevronRight size={13} className="shrink-0" />
              <span className="text-[#1d1d1f]">{name}</span>
            </>
          )}
        </nav>

        {/* Başlık (boş kategoride ad "Yolda" başlığına taşınır) */}
        {!isEmpty && (
          <header className="border-b border-[#e8e8ed] py-7 md:py-14">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
              {name}
            </h1>
          </header>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-16 md:px-6 md:pb-24">
        {/* Alt kategoriler */}
        {subcategories.length > 0 && (
          <section className="pt-8 md:pt-12">
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
              {subcategories.map((c) => (
                <Link
                  key={c.slug}
                  href={lp(`/urunler/${c.slug}`)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8e8ed] bg-white transition-all hover:border-[#d2d2d7] hover:shadow-md md:rounded-3xl"
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f5f5f7]">
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={isEn ? c.nameEn : c.nameTr}
                        fill
                        sizes="(max-width: 640px) 50vw, 380px"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] md:p-8"
                      />
                    ) : (
                      <span className="text-5xl font-semibold text-[#d2d2d7]">
                        {(isEn ? c.nameEn : c.nameTr).charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2 p-4 md:gap-3 md:p-6">
                    <h3 className="text-[15px] font-semibold leading-snug text-[#1d1d1f] md:text-lg">
                      {isEn ? c.nameEn : c.nameTr}
                    </h3>
                    <ChevronRight
                      size={20}
                      className="shrink-0 text-[#86868b] transition-transform group-hover:translate-x-1 group-hover:text-[#1d1d1f]"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ürünler */}
        {products.length > 0 && (
          <section className="pt-8 md:pt-12">
            {subcategories.length > 0 && (
              <h2 className="mb-5 text-xl font-semibold tracking-tight md:mb-8 md:text-2xl">
                {isEn ? "Products" : "Ürünler"}
              </h2>
            )}
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
              {products.map((p) => {
                const img = isEn ? p.imageEn ?? p.imageTr : p.imageTr;
                return (
                  <Link
                    key={p.slug}
                    href={lp(`/urun/${p.slug}`)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8e8ed] bg-white transition-all hover:border-[#d2d2d7] hover:shadow-md md:rounded-3xl"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f5f5f7]">
                      {img ? (
                        <Image
                          src={img}
                          alt={isEn ? p.nameEn : p.nameTr}
                          fill
                          sizes="(max-width: 640px) 50vw, 380px"
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] md:p-8"
                        />
                      ) : (
                        <span className="text-5xl font-semibold text-[#d2d2d7]">
                          {(isEn ? p.nameEn : p.nameTr).charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2 p-4 md:gap-3 md:p-6">
                      <h3 className="text-[15px] font-semibold leading-snug text-[#1d1d1f] md:text-lg">
                        {isEn ? p.nameEn : p.nameTr}
                      </h3>
                      <ChevronRight
                        size={20}
                        className="shrink-0 text-[#86868b] transition-transform group-hover:translate-x-1 group-hover:text-[#1d1d1f]"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Boş durum */}
        {isEmpty && (
          <section className="relative pt-4 text-center md:pt-7">
            <Link
              href={backHref}
              aria-label={isEn ? "Back" : "Geri"}
              className={`absolute left-0 top-4 md:top-7 ${backButtonClass}`}
            >
              <ArrowLeft size={19} />
            </Link>
            <h1 className="mx-auto max-w-4xl text-3xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              {isEn ? `${name} is on its way.` : `${name} yolda.`}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-[17px] leading-relaxed text-[#6e6e73] md:mt-5 md:text-[24px]">
              {isEn
                ? "We're preparing this lineup with care. It will take its place here very soon."
                : "Bu ürün grubunu özenle hazırlıyoruz. Çok yakında burada yerini alacak."}
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl bg-[#f5f5f7] md:mt-8 md:rounded-[28px] lg:-mx-24">
              <video
                src="/bosurun.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="aspect-video h-auto w-full object-cover"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
