"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileText,
  ShieldCheck,
  BookOpen,
  Box,
  Phone,
  Mail,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import AmbientGlow from "@/app/components/AmbientGlow";
import ProductImageZoom from "@/app/components/ProductImageZoom";
import type { ProductCard, ProductDetailData } from "@/lib/catalog";

/* Doküman tipi → etiket + ikon */
const DOC_META: Record<
  string,
  { tr: string; en: string; Icon: typeof FileText }
> = {
  teknik: { tr: "Teknik Doküman", en: "Technical Document", Icon: FileText },
  kilavuz: { tr: "Kullanım Kılavuzu", en: "User Manual", Icon: BookOpen },
  sertifika: { tr: "Sertifika", en: "Certificate", Icon: ShieldCheck },
  katalog: { tr: "Katalog", en: "Catalogue", Icon: FileText },
  cad: { tr: "CAD Çizimi", en: "CAD Drawing", Icon: Box },
};

export default function ProductDetail({
  product,
  relatedProducts = [],
}: {
  product: ProductDetailData;
  relatedProducts?: ProductCard[];
}) {
  const { locale, t } = useLanguage();
  const isEn = locale === "EN";
  const [active, setActive] = useState(0);

  const name = isEn ? product.nameEn : product.nameTr;
  const desc = isEn ? product.descEn ?? product.descTr : product.descTr;
  const categoryName = product.category
    ? isEn
      ? product.category.nameEn
      : product.category.nameTr
    : null;

  const appImage = isEn
    ? product.appImageEn ?? product.appImageTr
    : product.appImageTr;

  // Görsel seti: galeri (yoksa ana görsel). Dile göre urlEn tercih edilir.
  const images = useMemo(() => {
    const fromGallery = product.gallery.map((g) =>
      isEn ? g.urlEn ?? g.url : g.url
    );
    if (fromGallery.length) return fromGallery;
    const main = isEn
      ? product.mainImageEn ?? product.mainImageTr
      : product.mainImageTr;
    return main ? [main] : [];
  }, [product, isEn]);

  const current = images[Math.min(active, images.length - 1)] ?? null;

  const documents = product.documents.map((d) => ({
    name: isEn ? d.nameEn : d.nameTr,
    href: isEn ? d.urlEn ?? d.url : d.url,
    meta: DOC_META[d.type] ?? {
      tr: "Doküman",
      en: "Document",
      Icon: FileText,
    },
  }));

  return (
    <div className="relative isolate overflow-hidden bg-white text-[#1d1d1f]">
      <AmbientGlow />
      {/* Üst gezinme */}
      <div className="relative mx-auto max-w-6xl px-5 pt-7 md:px-6 md:pt-14">
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#86868b]">
          <Link href="/urunler" className="transition-colors hover:text-[#1d1d1f]">
            {isEn ? "Products" : "Ürünler"}
          </Link>
          {categoryName && product.category && (
            <>
              <ChevronRight size={13} className="shrink-0" />
              <Link
                href={`/urunler/${product.category.slug}`}
                className="transition-colors hover:text-[#1d1d1f]"
              >
                {categoryName}
              </Link>
            </>
          )}
          <ChevronRight size={13} className="shrink-0" />
          <span className="truncate text-[#1d1d1f]">{name}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-7 md:px-6 md:pt-14">
        <div className="relative text-center">
          <Link
            href={product.category ? `/urunler/${product.category.slug}` : "/urunler"}
            aria-label={isEn ? "Back" : "Geri"}
            className="absolute -top-2 left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#dc2626] bg-[#ececf0] text-[#1d1d1f] transition-colors hover:bg-[#fef2f2]"
          >
            <ArrowLeft size={19} />
          </Link>
          {categoryName && (
            <p className="text-[13px] font-semibold tracking-wide text-[#dc2626] md:text-sm">
              {categoryName}
            </p>
          )}
          <h1 className="mx-auto mt-2 max-w-4xl text-3xl font-semibold leading-[1.1] tracking-tight md:mt-3 md:text-6xl">
            {name}
          </h1>
        </div>

        {current && (
          <div className="mt-7 md:mt-12">
            <ProductImageZoom key={current} src={current} alt={name} priority />

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 md:mt-6 md:gap-3">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${name} ${i + 1}`}
                    className={`relative h-14 w-14 overflow-hidden rounded-xl border bg-[#f5f5f7] transition-all md:h-20 md:w-20 ${
                      i === Math.min(active, images.length - 1)
                        ? "border-[#1d1d1f]"
                        : "border-transparent hover:border-[#d2d2d7]"
                    }`}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Genel bakış / açıklama */}
      {desc && (
        <section className="mx-auto max-w-3xl px-5 py-12 md:px-6 md:py-24">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight md:mb-8 md:text-3xl">
            {t("product.overview")}
          </h2>
          <div className="space-y-5 text-[16px] leading-[1.75] text-[#424245] md:text-[17px]">
            {renderDescription(desc)}
          </div>
        </section>
      )}

      {/* Uygulama görseli */}
      {appImage && (
        <section className="bg-[#f5f5f7] py-12 md:py-24">
          <div className="mx-auto max-w-5xl px-5 md:px-6">
            <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight md:mb-10 md:text-3xl">
              {isEn ? "In Application" : "Uygulama"}
            </h2>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white md:rounded-[28px]">
              <Image
                src={appImage}
                alt={isEn ? `${name} application` : `${name} uygulama`}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain p-4 md:p-10"
              />
            </div>
          </div>
        </section>
      )}

      {/* Teknik tablolar */}
      {product.specTables.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 py-12 md:px-6 md:py-24">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight md:mb-10 md:text-3xl">
            {t("product.technicalData")}
          </h2>
          <div className="space-y-8 md:space-y-12">
            {product.specTables.map((table, ti) => {
              const tableName = isEn ? table.nameEn || table.name : table.name;
              const tableData =
                isEn && table.dataEn?.length ? table.dataEn : table.data;
              return (
                <div key={ti}>
                  {tableName && (
                    <h3 className="mb-4 text-lg font-semibold text-[#1d1d1f]">
                      {tableName}
                    </h3>
                  )}
                  <SpecTableView data={tableData} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Dokümanlar */}
      {documents.length > 0 && (
        <section className="border-t border-[#e8e8ed] bg-white py-12 md:py-24">
          <div className="mx-auto max-w-5xl px-5 md:px-6">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight md:mb-10 md:text-3xl">
              {t("product.documents")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
              {documents.map((doc, i) => {
                const Icon = doc.meta.Icon;
                return (
                  <a
                    key={i}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl border border-[#e8e8ed] bg-white p-5 transition-all hover:border-[#d2d2d7] hover:shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#dc2626]">
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-[#1d1d1f]">
                        {doc.name}
                      </span>
                      <span className="text-[13px] text-[#86868b]">
                        {isEn ? doc.meta.en : doc.meta.tr}
                      </span>
                    </span>
                    <Download
                      size={18}
                      className="shrink-0 text-[#86868b] transition-colors group-hover:text-[#1d1d1f]"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Aynı kategorideki diğer ürünler */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#e8e8ed] bg-[#f5f5f7] py-12 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-6">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight md:mb-10 md:text-3xl">
              {t("product.related")}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">
              {relatedProducts.map((p) => {
                const img = isEn ? p.imageEn ?? p.imageTr : p.imageTr;
                const pName = isEn ? p.nameEn : p.nameTr;
                return (
                  <Link
                    key={p.slug}
                    href={`/urun/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8e8ed] bg-white transition-all hover:border-[#d2d2d7] hover:shadow-md md:rounded-3xl"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#f5f5f7]">
                      {img ? (
                        <Image
                          src={img}
                          alt={pName}
                          fill
                          sizes="(max-width: 640px) 50vw, 380px"
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] md:p-8"
                        />
                      ) : (
                        <span className="text-5xl font-semibold text-[#d2d2d7]">
                          {pName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between gap-2 p-4 md:gap-3 md:p-6">
                      <h3 className="text-[15px] font-semibold leading-snug text-[#1d1d1f] md:text-lg">
                        {pName}
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
          </div>
        </section>
      )}

      {/* İletişim / teklif çağrısı */}
      <section
        className="relative overflow-hidden py-12 md:py-20"
        style={{
          backgroundImage:
            "linear-gradient(to left, #ef4444 0%, #dc2626 35%, #b91c1c 70%, #7f1d1d 100%)",
        }}
      >
        {/* Hafif doku için yumuşak ışık lekeleri */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-white/[0.07] blur-3xl"
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center gap-7 px-5 text-center lg:flex-row lg:gap-16 lg:px-6 lg:text-left">
          <Image
            src="/fav.png"
            alt="TayTech"
            width={512}
            height={512}
            className="h-24 w-24 shrink-0 object-contain brightness-0 invert drop-shadow-lg lg:h-44 lg:w-44"
          />
          <div className="flex max-w-xl flex-col items-center lg:items-start">
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {t("product.cta.title").replace("{name}", name)}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85 md:text-[17px]">
              {t("product.cta.desc")}
            </p>
            <Link
              href="/iletisim"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-semibold text-[#b91c1c] shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-100"
            >
              {t("product.cta.btn")}
              <ChevronRight size={17} className="shrink-0" />
            </Link>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 lg:justify-start">
              <a
                href="tel:+902625025149"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-white/90 transition-colors hover:text-white"
              >
                <Phone size={16} className="shrink-0" />
                {t("contact.phone1")}
              </a>
              <a
                href="mailto:info@taytech.com.tr"
                className="inline-flex items-center gap-2 text-[15px] font-medium text-white/90 transition-colors hover:text-white"
              >
                <Mail size={16} className="shrink-0" />
                {t("contact.emailAddr")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Alt gezinme */}
      <div className="mx-auto max-w-5xl px-5 pb-14 pt-10 md:px-6 md:pb-20 md:pt-14">
        <Link
          href={
            product.category ? `/urunler/${product.category.slug}` : "/urunler"
          }
          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#06c] transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} className="shrink-0" />
          {product.category && categoryName ? categoryName : t("product.allProducts")}
        </Link>
      </div>
    </div>
  );
}

/* Teknik tablo — ilk satır başlık kabul edilir. */
function SpecTableView({ data }: { data: string[][] }) {
  if (!data.length) return null;
  const [head, ...rows] = data;
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e8e8ed]">
      <table className="w-full border-collapse text-left text-[14px]">
        <thead>
          <tr className="bg-[#f5f5f7]">
            {head.map((cell, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-4 py-3 font-semibold text-[#1d1d1f]"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-[#e8e8ed]">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="whitespace-nowrap px-4 py-3 text-[#424245]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Serbest metin açıklamayı başlık / madde / spec satırı / paragraf olarak ayrıştırır. */
function renderDescription(text: string) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className="ml-1 space-y-2.5 border-l-2 border-[#e8e8ed] pl-5"
      >
        {bullets.map((b, i) => (
          <li key={i} className="text-[#424245]">
            {b}
          </li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const isHeading = (line: string) =>
    /[a-zçğıöşü]/i.test(line) &&
    line === line.toLocaleUpperCase("tr-TR") &&
    !line.includes(":") &&
    line.length <= 60;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushBullets();
      continue;
    }
    if (line.startsWith("•") || line.startsWith("-")) {
      bullets.push(line.replace(/^[•-]\s*/, ""));
      continue;
    }
    flushBullets();
    if (isHeading(line)) {
      blocks.push(
        <h3
          key={`h-${blocks.length}`}
          className="pt-4 text-sm font-semibold uppercase tracking-wide text-[#1d1d1f]"
        >
          {line}
        </h3>
      );
    } else if (line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
      blocks.push(
        <div
          key={`s-${blocks.length}`}
          className="flex flex-wrap gap-x-6 gap-y-1.5 text-[15px] text-[#424245]"
        >
          {parts.map((p, i) => (
            <span key={i}>{p}</span>
          ))}
        </div>
      );
    } else {
      blocks.push(
        <p key={`p-${blocks.length}`}>{line}</p>
      );
    }
  }
  flushBullets();
  return blocks;
}
