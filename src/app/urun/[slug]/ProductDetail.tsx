"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

/**
 * Ürün detay sayfası — dokümantasyon düzeni.
 * Solda sayfa boyunca sabit kalan bölüm navigasyonu (masaüstü), sağda tek
 * kolon halinde akan içerik. Bölümler ince çizgilerle ayrılır; kutu/panel
 * yığını yoktur. Mobilde sol ray yerine yapışkan çip şeridi kullanılır.
 */
export default function ProductDetail({
  product,
  relatedProducts = [],
}: {
  product: ProductDetailData;
  relatedProducts?: ProductCard[];
}) {
  const { locale, t, lp } = useLanguage();
  const isEn = locale === "EN";
  const [active, setActive] = useState(0);

  const name = isEn ? product.nameEn : product.nameTr;
  const desc = isEn ? product.descEn ?? product.descTr : product.descTr;
  const categoryName = product.category
    ? isEn
      ? product.category.nameEn
      : product.category.nameTr
    : null;
  const categoryHref = product.category
    ? `/urunler/${product.category.slug}`
    : "/urunler";

  const appImage = isEn
    ? product.appImageEn ?? product.appImageTr
    : product.appImageTr;

  // Görsel seti: galeri (yoksa ana görsel). Dile göre urlEn tercih edilir;
  // yalnız diğer dile ait kayıtlar (boş url) atlanır.
  const images = useMemo(() => {
    const fromGallery = product.gallery
      .map((g) => (isEn ? g.urlEn ?? g.url : g.url))
      .filter((u): u is string => Boolean(u));
    if (fromGallery.length) return fromGallery;
    const main = isEn
      ? product.mainImageEn ?? product.mainImageTr
      : product.mainImageTr;
    return main ? [main] : [];
  }, [product, isEn]);

  const current = images[Math.min(active, images.length - 1)] ?? null;

  const features = isEn
    ? product.featuresEn ?? product.featuresTr
    : product.featuresTr;

  const documents = product.documents.map((d) => ({
    name: isEn ? d.nameEn : d.nameTr,
    href: isEn ? d.urlEn ?? d.url : d.url,
    meta: DOC_META[d.type] ?? {
      tr: "Doküman",
      en: "Document",
      Icon: FileText,
    },
  }));

  /* ----------------------- Bölüm navigasyonu ----------------------- */
  const navSections = [
    desc && { id: "genel-bakis", label: t("product.overview") },
    features && { id: "teknik-ozellikler", label: t("product.features") },
    product.specTables.length > 0 && {
      id: "teknik-veriler",
      label: t("product.technicalData"),
    },
    appImage && { id: "uygulama", label: isEn ? "In Application" : "Uygulama" },
    documents.length > 0 && { id: "dokumanlar", label: t("product.documents") },
  ].filter((s): s is { id: string; label: string } => Boolean(s));

  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const ids = navSections.map((s) => s.id);
    if (!ids.length) return;
    setActiveSection((cur) => (ids.includes(cur) ? cur : ids[0]));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug, locale, navSections.length]);

  const scrollTo = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="bg-white text-[#1d1d1f]">
      {/* ============ Sol ray + içerik ============ */}
      <div className="mx-auto flex w-full max-w-[1440px]">
        {/* Sol ray — masaüstü */}
        <aside className="hidden w-[280px] shrink-0 border-r border-[#e8e8ed] lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-7 pb-10 pt-10 xl:px-9">
            <Link
              href={lp(categoryHref)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f]"
            >
              <ArrowLeft size={14} className="shrink-0" />
              {categoryName ?? (isEn ? "Products" : "Ürünler")}
            </Link>

            <p className="mt-5 text-[16px] font-semibold leading-snug tracking-tight">
              {name}
            </p>

            <nav className="mt-7">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a1a1a6]">
                {isEn ? "Contents" : "İçindekiler"}
              </p>
              <ul className="mt-2 space-y-0.5">
                {navSections.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(s.id)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-[13.5px] leading-snug transition-colors ${
                        activeSection === s.id
                          ? "bg-[#f5f5f7] font-semibold text-[#1d1d1f]"
                          : "text-[#6e6e73] hover:bg-[#fafafa] hover:text-[#1d1d1f]"
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 border-t border-[#e8e8ed] pt-7">
              <Link
                href={lp("/iletisim")}
                className="flex items-center justify-center gap-1.5 rounded-full bg-[#dc2626] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#b91c1c]"
              >
                {isEn ? "Request a Quote" : "Teklif Al"}
                <ChevronRight size={14} className="shrink-0" />
              </Link>
              {/* İletişim bilgileri yalnız Türkçe sayfada gösterilir */}
              {!isEn && (
                <div className="mt-5 space-y-2.5">
                  <a
                    href="tel:+902625025149"
                    className="flex items-center gap-2.5 text-[13px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
                  >
                    <Phone size={14} className="shrink-0 text-[#dc2626]" />
                    {t("contact.phone1")}
                  </a>
                  <a
                    href="mailto:info@taytech.com.tr"
                    className="flex items-center gap-2.5 text-[13px] text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
                  >
                    <Mail size={14} className="shrink-0 text-[#dc2626]" />
                    info@taytech.com.tr
                  </a>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* İçerik kolonu */}
        <main className="min-w-0 flex-1">
          {/* Mobil: yapışkan bölüm çipleri */}
          {navSections.length > 1 && (
            <nav className="sticky top-16 z-30 border-b border-[#e8e8ed] bg-white/90 backdrop-blur-md lg:hidden">
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-5 py-2.5">
                {navSections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                      activeSection === s.id
                        ? "bg-[#1d1d1f] text-white"
                        : "bg-[#f5f5f7] text-[#424245] active:bg-[#e8e8ed]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </nav>
          )}

          <div className="px-5 md:px-10 xl:px-14">
            <div className="mx-auto max-w-[860px]">
              {/* Başlık */}
              <header className="pb-8 pt-8 md:pb-10 md:pt-12">
                {/* Kırıntı — mobilde geri bağlantısı görevi görür */}
                <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-[#86868b] lg:hidden">
                  <Link
                    href={lp("/urunler")}
                    className="transition-colors hover:text-[#1d1d1f]"
                  >
                    {isEn ? "Products" : "Ürünler"}
                  </Link>
                  {categoryName && (
                    <>
                      <ChevronRight size={13} className="shrink-0" />
                      <Link
                        href={lp(categoryHref)}
                        className="transition-colors hover:text-[#1d1d1f]"
                      >
                        {categoryName}
                      </Link>
                    </>
                  )}
                </nav>

                {categoryName && (
                  <p className="mt-5 text-[13px] font-semibold tracking-wide text-[#dc2626] lg:mt-0">
                    {categoryName}
                  </p>
                )}
                <h1 className="mt-2 text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                  {name}
                </h1>
              </header>

              {/* Galeri */}
              {current && (
                <div className="pb-10 md:pb-14">
                  <ProductImageZoom key={current} src={current} alt={name} priority />
                  {images.length > 1 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2.5 md:mt-5">
                      {images.map((img, i) => (
                        <button
                          key={img + i}
                          type="button"
                          onClick={() => setActive(i)}
                          aria-label={`${name} ${i + 1}`}
                          className={`relative h-14 w-14 overflow-hidden rounded-xl border bg-[#f5f5f7] transition-all md:h-[72px] md:w-[72px] ${
                            i === Math.min(active, images.length - 1)
                              ? "border-[#1d1d1f]"
                              : "border-transparent hover:border-[#d2d2d7]"
                          }`}
                        >
                          <Image
                            src={img}
                            alt=""
                            fill
                            sizes="72px"
                            className="object-contain p-2"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Genel bakış */}
              {desc && (
                <section
                  id="genel-bakis"
                  className="scroll-mt-24 border-t border-[#e8e8ed] py-10 md:py-14 lg:scroll-mt-20"
                >
                  <h2 className="text-[22px] font-semibold tracking-tight md:text-[28px]">
                    {t("product.overview")}
                  </h2>
                  <div className="mt-6 space-y-5 text-[16px] leading-[1.75] text-[#424245] md:mt-8 md:text-[17px]">
                    {renderDescription(desc)}
                  </div>
                </section>
              )}

              {/* Teknik özellikler */}
              {features && (
                <section
                  id="teknik-ozellikler"
                  className="scroll-mt-24 border-t border-[#e8e8ed] py-10 md:py-14 lg:scroll-mt-20"
                >
                  <h2 className="text-[22px] font-semibold tracking-tight md:text-[28px]">
                    {t("product.features")}
                  </h2>
                  <div className="mt-6 md:mt-8">
                    <FeatureList text={features} />
                  </div>
                </section>
              )}

              {/* Teknik tablolar */}
              {product.specTables.length > 0 && (
                <section
                  id="teknik-veriler"
                  className="scroll-mt-24 border-t border-[#e8e8ed] py-10 md:py-14 lg:scroll-mt-20"
                >
                  <h2 className="text-[22px] font-semibold tracking-tight md:text-[28px]">
                    {t("product.technicalData")}
                  </h2>
                  <div className="mt-6 space-y-8 md:mt-8 md:space-y-12">
                    {product.specTables.map((table, ti) => {
                      const tableName = isEn
                        ? table.nameEn || table.name
                        : table.name;
                      const tableData =
                        isEn && table.dataEn?.length ? table.dataEn : table.data;
                      return (
                        <div key={ti}>
                          {tableName && (
                            <h3 className="mb-4 text-[17px] font-semibold text-[#1d1d1f]">
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

              {/* Uygulama görseli */}
              {appImage && (
                <section
                  id="uygulama"
                  className="scroll-mt-24 border-t border-[#e8e8ed] py-10 md:py-14 lg:scroll-mt-20"
                >
                  <h2 className="text-[22px] font-semibold tracking-tight md:text-[28px]">
                    {isEn ? "In Application" : "Uygulama"}
                  </h2>
                  <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#f5f5f7] md:mt-8">
                    <Image
                      src={appImage}
                      alt={isEn ? `${name} application` : `${name} uygulama`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 860px"
                      className="object-contain p-4 md:p-8"
                    />
                  </div>
                </section>
              )}

              {/* Dokümanlar */}
              {documents.length > 0 && (
                <section
                  id="dokumanlar"
                  className="scroll-mt-24 border-t border-[#e8e8ed] py-10 pb-16 md:py-14 md:pb-24 lg:scroll-mt-20"
                >
                  <h2 className="text-[22px] font-semibold tracking-tight md:text-[28px]">
                    {t("product.documents")}
                  </h2>
                  <ul className="mt-6 divide-y divide-[#e8e8ed] border-y border-[#e8e8ed] md:mt-8">
                    {documents.map((doc, i) => {
                      const Icon = doc.meta.Icon;
                      return (
                        <li key={i}>
                          <a
                            href={doc.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 py-4 transition-colors hover:bg-[#fafafa] md:px-2"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f7] text-[#dc2626]">
                              <Icon size={18} />
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
                              size={17}
                              className="shrink-0 text-[#a1a1a6] transition-colors group-hover:text-[#1d1d1f]"
                            />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>

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
                    href={lp(`/urun/${p.slug}`)}
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
              href={lp("/iletisim")}
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

      {/* Alt gezinme — mobil için geri bağlantısı */}
      <div className="mx-auto max-w-6xl px-5 pb-14 pt-10 md:px-6 md:pb-20 md:pt-14 lg:hidden">
        <Link
          href={lp(categoryHref)}
          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#06c] transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} className="shrink-0" />
          {categoryName ?? t("product.allProducts")}
        </Link>
      </div>
    </div>
  );
}

/*
 * Teknik özellikler listesi — açık zeminli teknik föy görünümü.
 * Format: satır başına bir madde; ";"/":" ile biten satır grup başlığı,
 * tab ile başlayan satır o grubun alt maddesidir.
 */
function FeatureList({ text }: { text: string }) {
  type Group = { title: string | null; items: string[] };
  const groups: Group[] = [];
  let cur: Group = { title: null, items: [] };

  for (const raw of text.split("\n")) {
    const line = raw.replace(/^\t+/, "").trim();
    if (!line) continue;
    const isSub = raw.startsWith("\t");
    const isGroupHead = !isSub && /[;:]$/.test(line);
    if (isGroupHead) {
      if (cur.items.length || cur.title) groups.push(cur);
      cur = { title: line.replace(/[;:]\s*$/, ""), items: [] };
    } else if (isSub) {
      cur.items.push(line);
    } else if (cur.title) {
      groups.push(cur);
      cur = { title: null, items: [line] };
    } else {
      cur.items.push(line);
    }
  }
  if (cur.items.length || cur.title) groups.push(cur);

  const Item = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-3 border-b border-[#f0f0f2] py-3 text-[15px] leading-relaxed text-[#424245]">
      <span
        aria-hidden
        className="mt-[9px] h-[7px] w-[7px] shrink-0 rounded-[2px] bg-[#dc2626]"
      />
      <span className="min-w-0">{children}</span>
    </li>
  );

  return (
    <div className="space-y-8">
      {groups.map((g, gi) =>
        g.title ? (
          <div key={gi}>
            <h3 className="mb-2 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1d1d1f]">
              {g.title}
              <span aria-hidden className="h-px flex-1 bg-[#e8e8ed]" />
            </h3>
            <ul className="columns-1 gap-x-12 md:columns-2 [&>li]:break-inside-avoid">
              {g.items.map((it, i) => (
                <Item key={i}>{it}</Item>
              ))}
            </ul>
          </div>
        ) : (
          <ul
            key={gi}
            className="columns-1 gap-x-12 md:columns-2 [&>li]:break-inside-avoid"
          >
            {g.items.map((it, i) => (
              <Item key={i}>{it}</Item>
            ))}
          </ul>
        )
      )}
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
                  className={`px-4 py-3 ${
                    ci === 0 && row.length === 2
                      ? "font-medium text-[#1d1d1f]"
                      : "text-[#424245]"
                  }`}
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
