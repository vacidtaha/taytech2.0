"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Download,
  FileText,
  BookOpen,
  ShieldCheck,
  Box,
  Files,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import type { DocumentItem } from "@/lib/catalog";
import { docTypeLabels as typeLabels } from "../components/DocIcon";

/* Filtrede gösterilecek tip sırası (yalnızca veride var olanlar listelenir). */
const TYPE_ORDER = ["katalog", "teknik", "kilavuz", "sertifika", "cad", "genel"];

const TYPE_ICONS: Record<string, typeof FileText> = {
  katalog: Files,
  teknik: FileText,
  kilavuz: BookOpen,
  sertifika: ShieldCheck,
  cad: Box,
  genel: Files,
};

type ProductGroup = {
  slug: string;
  productName: string;
  categoryName: string;
  docs: DocumentItem[];
};

/**
 * Kök kategorisinden bağımsız olarak filtrede kendi başına (üst seviyede)
 * gösterilecek 2. seviye kategoriler (TR adıyla).
 */
const PROMOTED_SUBS = new Set(["Manyetik Filtreler"]);

/**
 * Filtrede ara basamak olarak gösterilmeyen 2. seviye kategoriler:
 * bunların altındaki seriler doğrudan üst kategorinin altında listelenir
 * (örn. Isı Ağları'na basınca SmartHexa/HydroHexa serileri direkt görünür).
 */
const PASSTHROUGH_SUBS = new Set(["Isı İstasyonları"]);

/** Dokümanın filtre üst kategorisi (TR anahtar + iki dilde ad). */
function groupTopOf(d: DocumentItem) {
  if (PROMOTED_SUBS.has(d.subCategoryNameTr)) {
    return { key: d.subCategoryNameTr, nameTr: d.subCategoryNameTr, nameEn: d.subCategoryNameEn };
  }
  return { key: d.topCategoryNameTr, nameTr: d.topCategoryNameTr, nameEn: d.topCategoryNameEn };
}

/** Dokümanın filtre alt kategorisi (yükseltilmiş/atlanmışsa bir alt seviye). */
function groupSubOf(d: DocumentItem) {
  if (PROMOTED_SUBS.has(d.subCategoryNameTr) || PASSTHROUGH_SUBS.has(d.subCategoryNameTr)) {
    if (!d.subSubCategoryNameTr) return null;
    return { key: d.subSubCategoryNameTr, nameTr: d.subSubCategoryNameTr, nameEn: d.subSubCategoryNameEn };
  }
  if (!d.subCategoryNameTr) return null;
  return { key: d.subCategoryNameTr, nameTr: d.subCategoryNameTr, nameEn: d.subCategoryNameEn };
}

/** Dokümanın 2. seviye alt (alt-alt) kategorisi — yoksa null. */
function groupSub2Of(d: DocumentItem) {
  if (PROMOTED_SUBS.has(d.subCategoryNameTr) || PASSTHROUGH_SUBS.has(d.subCategoryNameTr)) return null;
  if (!d.subSubCategoryNameTr) return null;
  return { key: d.subSubCategoryNameTr, nameTr: d.subSubCategoryNameTr, nameEn: d.subSubCategoryNameEn };
}

/**
 * Doküman Merkezi — teknik doküman kütüphanesi düzeni.
 * Solda kategori raili, üstte arama + tip filtreleri; dokümanlar ürün
 * bazında gruplanmış dosya satırları halinde listelenir.
 */
export default function DocumentCenter({ docs }: { docs: DocumentItem[] }) {
  const { locale, lp } = useLanguage();
  const isEn = locale === "EN";
  const [search, setSearch] = useState("");
  const [selCategory, setSelCategory] = useState<string | null>(null);
  const [selSub, setSelSub] = useState<string | null>(null);
  const [selSub2, setSelSub2] = useState<string | null>(null);
  const [selTypes, setSelTypes] = useState<string[]>([]);

  const tl = (type: string) => typeLabels[type]?.[isEn ? "en" : "tr"] ?? type;
  const docUrl = (doc: DocumentItem) => (isEn && doc.urlEn ? doc.urlEn : doc.url);

  const pickCategory = (key: string | null) => {
    setSelCategory((prev) => (prev === key ? null : key));
    setSelSub(null);
    setSelSub2(null);
  };

  const pickSub = (key: string) => {
    setSelSub((prev) => (prev === key ? null : key));
    setSelSub2(null);
  };

  /* Üst kategoriler + alt ve alt-alt kategorileri (veride görülme sırasıyla). */
  const categories = useMemo(() => {
    type Sub2Entry = { name: string; count: number };
    type SubEntry = { name: string; count: number; subs: Map<string, Sub2Entry> };
    const seen = new Map<
      string,
      { name: string; count: number; subs: Map<string, SubEntry> }
    >();
    for (const d of docs) {
      const top = groupTopOf(d);
      if (!top.key) continue;
      let cur = seen.get(top.key);
      if (!cur) {
        cur = { name: isEn ? top.nameEn : top.nameTr, count: 0, subs: new Map() };
        seen.set(top.key, cur);
      }
      cur.count += 1;
      const sub = groupSubOf(d);
      if (!sub) continue;
      let s = cur.subs.get(sub.key);
      if (!s) {
        s = { name: isEn ? sub.nameEn : sub.nameTr, count: 0, subs: new Map() };
        cur.subs.set(sub.key, s);
      }
      s.count += 1;
      const sub2 = groupSub2Of(d);
      if (sub2) {
        const s2 = s.subs.get(sub2.key);
        if (s2) s2.count += 1;
        else s.subs.set(sub2.key, { name: isEn ? sub2.nameEn : sub2.nameTr, count: 1 });
      }
    }
    return [...seen.entries()].map(([key, v]) => ({
      key,
      name: v.name,
      count: v.count,
      subs: [...v.subs.entries()].map(([sk, sv]) => ({
        key: sk,
        name: sv.name,
        count: sv.count,
        subs: [...sv.subs.entries()].map(([s2k, s2v]) => ({ key: s2k, ...s2v })),
      })),
    }));
  }, [docs, isEn]);

  const typeKeys = useMemo(() => {
    const present = new Set(docs.map((d) => d.type));
    return TYPE_ORDER.filter((t) => present.has(t));
  }, [docs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return docs.filter((d) => {
      const name = (isEn ? d.nameEn : d.nameTr).toLowerCase();
      const prod = (isEn ? d.productNameEn : d.productNameTr).toLowerCase();
      const top = groupTopOf(d);
      const cat = (isEn ? top.nameEn : top.nameTr).toLowerCase();
      const matchSearch =
        !q || name.includes(q) || prod.includes(q) || cat.includes(q);
      const matchCat = !selCategory || top.key === selCategory;
      const matchSub = !selSub || groupSubOf(d)?.key === selSub;
      const matchSub2 = !selSub2 || groupSub2Of(d)?.key === selSub2;
      const matchType = selTypes.length === 0 || selTypes.includes(d.type);
      return matchSearch && matchCat && matchSub && matchSub2 && matchType;
    });
  }, [docs, search, selCategory, selSub, selSub2, selTypes, isEn]);

  /* Dokümanları ürün bazında grupla (veri sırası korunur). */
  const groups = useMemo(() => {
    const map = new Map<string, ProductGroup>();
    for (const d of filtered) {
      let g = map.get(d.productSlug);
      if (!g) {
        g = {
          slug: d.productSlug,
          productName: isEn ? d.productNameEn : d.productNameTr,
          categoryName: isEn ? d.categoryNameEn : d.categoryNameTr,
          docs: [],
        };
        map.set(d.productSlug, g);
      }
      g.docs.push(d);
    }
    return [...map.values()];
  }, [filtered, isEn]);

  const toggleType = (t: string) =>
    setSelTypes((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t]
    );

  const activeCount =
    (selCategory ? 1 : 0) + (selSub ? 1 : 0) + (selSub2 ? 1 : 0) + selTypes.length;
  const clearAll = () => {
    setSearch("");
    setSelCategory(null);
    setSelSub(null);
    setSelSub2(null);
    setSelTypes([]);
  };
  const noDocs = docs.length === 0;

  const activeCat = categories.find((c) => c.key === selCategory) ?? null;
  const activeSub = activeCat?.subs.find((s) => s.key === selSub) ?? null;

  /* Kırmızı ray satırı — seçiliyken yarı saydam beyaz vurgu. */
  const railItem = (active: boolean) =>
    `flex w-full items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-left text-[15px] leading-snug transition-colors ${
      active
        ? "bg-white/15 font-semibold text-white"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;
  const railCount = (active: boolean) =>
    `shrink-0 text-[13px] ${active ? "text-white/70" : "text-white/45"}`;

  return (
    <div className="relative min-h-screen bg-white text-[#1d1d1f]">
      {/* Sol kırmızı bant — rayın arkasını ekranın sol kenarına kadar boyar */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 hidden lg:block"
        style={{
          width: "max(232px, calc((100vw - 1440px) / 2 + 232px))",
          background: "linear-gradient(180deg, #dc2626 0%, #991b1b 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-[1440px]">
        {/* Sol ray — kategoriler (masaüstü) */}
        <aside className="hidden min-h-screen w-[232px] shrink-0 lg:block">
          <div
            className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto px-5 pb-10 pt-12"
            style={{
              /* Ray içeriğini kırmızı bandın ortasına kaydırır (genişlik sabit kalır). */
              marginLeft: "min(0px, calc((1440px - 100vw) / 4))",
              marginRight: "max(0px, calc((100vw - 1440px) / 4))",
            }}
          >
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
              {isEn ? "Product Categories" : "Ürün Kategorileri"}
            </p>
            <ul className="mt-2 space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => pickCategory(null)}
                  className={railItem(selCategory === null)}
                >
                  <span>{isEn ? "All documents" : "Tüm dokümanlar"}</span>
                  <span className={railCount(selCategory === null)}>{docs.length}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => pickCategory(c.key)}
                    className={railItem(selCategory === c.key)}
                  >
                    <span className="min-w-0">{c.name}</span>
                    <span className={railCount(selCategory === c.key)}>{c.count}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Seçili kategorinin alt kategorileri — ayrı bölüm */}
            {activeCat && activeCat.subs.length > 0 && (
              <div className="mt-8 border-t border-white/20 pt-7">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  {isEn ? "Subcategories" : "Alt Kategoriler"}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {activeCat.subs.map((s) => (
                    <li key={s.key}>
                      <button
                        type="button"
                        onClick={() => pickSub(s.key)}
                        className={railItem(selSub === s.key)}
                      >
                        <span className="min-w-0">{s.name}</span>
                        <span className={railCount(selSub === s.key)}>{s.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Seçili alt kategorinin alt grupları — ayrı bölüm */}
            {activeSub && activeSub.subs.length > 0 && (
              <div className="mt-8 border-t border-white/20 pt-7">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
                  {isEn ? "Series" : "Seriler"}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {activeSub.subs.map((s2) => (
                    <li key={s2.key}>
                      <button
                        type="button"
                        onClick={() => setSelSub2(selSub2 === s2.key ? null : s2.key)}
                        className={railItem(selSub2 === s2.key)}
                      >
                        <span className="min-w-0">{s2.name}</span>
                        <span className={railCount(selSub2 === s2.key)}>{s2.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 border-t border-white/20 pt-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">
                {isEn ? "Document Type" : "Doküman Tipi"}
              </p>
              <ul className="mt-2 space-y-0.5">
                {typeKeys.map((tk) => {
                  const checked = selTypes.includes(tk);
                  const count = docs.filter((d) => d.type === tk).length;
                  return (
                    <li key={tk}>
                      <button
                        type="button"
                        onClick={() => toggleType(tk)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-[15px] leading-snug transition-colors ${
                          checked
                            ? "bg-white/10 font-semibold text-white"
                            : "text-white/85 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
                            checked
                              ? "border-white bg-white"
                              : "border-white/50 bg-transparent"
                          }`}
                        >
                          {checked && (
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                              <path
                                d="M2 5l2.5 2.5L8 3"
                                stroke="#dc2626"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1">{tl(tk)}</span>
                        <span
                          className={`shrink-0 text-[13px] ${checked ? "text-white/70" : "text-white/50"}`}
                        >
                          {count}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-7 text-[14px] font-semibold text-white underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                {isEn ? "Clear filters" : "Filtreleri temizle"}
              </button>
            )}
          </div>
        </aside>

        {/* İçerik */}
        <main className="min-w-0 flex-1">
          <div className="px-5 md:px-10 xl:px-14">
            <div className="mx-auto max-w-[900px]">
              {/* Başlık */}
              <header className="pb-8 pt-10 md:pb-10 md:pt-14">
                <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#dc2626]">
                  Taytech
                </p>
                <h1 className="mt-2 text-3xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                  {isEn ? "Document Centre" : "Doküman Merkezi"}
                </h1>
                <div className="mt-5 h-[3px] w-14 bg-[#dc2626]" />
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#6e6e73] md:text-[17px]">
                  {isEn
                    ? "Datasheets, flow diagrams, user manuals, certificates and CAD drawings for all our products — in one place."
                    : "Tüm ürünlerimize ait teknik föyler, akış şemaları, kullanım kılavuzları, sertifikalar ve CAD çizimleri — tek yerde."}
                </p>
              </header>

              {/* Arama */}
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    isEn
                      ? "Search by document, product or category..."
                      : "Doküman, ürün veya kategori ara..."
                  }
                  className="h-12 w-full rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] pl-11 pr-11 text-[15px] text-[#1d1d1f] outline-none transition-colors placeholder:text-[#86868b] focus:border-[#dc2626] focus:bg-white md:h-[52px]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label={isEn ? "Clear search" : "Aramayı temizle"}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#86868b] transition-colors hover:bg-[#e8e8ed] hover:text-[#1d1d1f]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Mobil: kategori + tip çipleri */}
              <div className="mt-4 lg:hidden">
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => pickCategory(null)}
                    className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                      selCategory === null
                        ? "bg-[#dc2626] text-white"
                        : "bg-[#f5f5f7] text-[#424245]"
                    }`}
                  >
                    {isEn ? "All" : "Tümü"}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => pickCategory(c.key)}
                      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                        selCategory === c.key
                          ? "bg-[#dc2626] text-white"
                          : "bg-[#f5f5f7] text-[#424245]"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                {(() => {
                  const active = categories.find((c) => c.key === selCategory);
                  if (!active || active.subs.length === 0) return null;
                  const activeSub = active.subs.find((s) => s.key === selSub);
                  return (
                    <>
                      <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
                        {active.subs.map((s) => (
                          <button
                            key={s.key}
                            type="button"
                            onClick={() => pickSub(s.key)}
                            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                              selSub === s.key
                                ? "border-[#dc2626] bg-[#dc2626]/5 text-[#dc2626]"
                                : "border-[#e8e8ed] bg-white text-[#424245]"
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                      {activeSub && activeSub.subs.length > 0 && (
                        <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
                          {activeSub.subs.map((s2) => (
                            <button
                              key={s2.key}
                              type="button"
                              onClick={() =>
                                setSelSub2(selSub2 === s2.key ? null : s2.key)
                              }
                              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                                selSub2 === s2.key
                                  ? "border-[#dc2626] bg-[#dc2626]/5 text-[#dc2626]"
                                  : "border-[#e8e8ed] bg-white text-[#424245]"
                              }`}
                            >
                              {s2.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
                <div className="no-scrollbar mt-1.5 flex gap-1.5 overflow-x-auto pb-1">
                  {typeKeys.map((tk) => (
                    <button
                      key={tk}
                      type="button"
                      onClick={() => toggleType(tk)}
                      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                        selTypes.includes(tk)
                          ? "border-[#dc2626] bg-[#dc2626]/5 text-[#dc2626]"
                          : "border-[#e8e8ed] bg-white text-[#424245]"
                      }`}
                    >
                      {tl(tk)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sonuç sayısı */}
              <div className="mt-6 flex items-center justify-between border-b border-[#e8e8ed] pb-3 md:mt-8">
                <p className="text-[13px] text-[#86868b]">
                  {filtered.length} {isEn ? "documents" : "doküman"}
                  {groups.length > 0 && (
                    <>
                      {" · "}
                      {groups.length} {isEn ? "products" : "ürün"}
                    </>
                  )}
                </p>
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-[13px] font-semibold text-[#dc2626] transition-opacity hover:opacity-70"
                  >
                    {isEn ? "Clear filters" : "Filtreleri temizle"}
                  </button>
                )}
              </div>

              {/* Ürün bazlı gruplar */}
              <div className="pb-16 md:pb-24">
                {groups.map((g) => (
                  <section key={g.slug} className="border-b border-[#e8e8ed] py-7 md:py-9">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#dc2626]">
                          {g.categoryName}
                        </p>
                        <h2 className="mt-1 text-[17px] font-semibold tracking-tight md:text-[19px]">
                          {g.productName}
                        </h2>
                      </div>
                      <Link
                        href={lp(`/urun/${g.slug}`)}
                        className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-[#dc2626] transition-opacity hover:opacity-70"
                      >
                        {isEn ? "View product" : "Ürünü gör"}
                        <ChevronRight size={14} className="shrink-0" />
                      </Link>
                    </div>

                    <ul className="mt-4 overflow-hidden rounded-xl border border-[#e8e8ed]">
                      {g.docs.map((doc, i) => {
                        const Icon = TYPE_ICONS[doc.type] ?? FileText;
                        return (
                          <li
                            key={doc.id}
                            className={i > 0 ? "border-t border-[#e8e8ed]" : ""}
                          >
                            <a
                              href={docUrl(doc)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-[#fafafa] md:gap-4 md:px-5"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dc2626]/[0.07] text-[#dc2626] md:h-10 md:w-10">
                                <Icon size={17} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[14.5px] font-medium text-[#1d1d1f] md:text-[15px]">
                                  {isEn ? doc.nameEn : doc.nameTr}
                                </span>
                                <span className="text-[12.5px] text-[#86868b]">
                                  {tl(doc.type)}
                                </span>
                              </span>
                              <Download
                                size={17}
                                className="shrink-0 text-[#a1a1a6] transition-colors group-hover:text-[#dc2626]"
                              />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}

                {/* Boş durum */}
                {filtered.length === 0 && (
                  <div className="py-20 text-center md:py-28">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f7] text-[#a1a1a6]">
                      <Search size={22} />
                    </span>
                    <h3 className="mt-5 text-[17px] font-semibold">
                      {noDocs
                        ? isEn
                          ? "No documents yet"
                          : "Henüz doküman eklenmedi"
                        : isEn
                          ? "No documents found"
                          : "Doküman bulunamadı"}
                    </h3>
                    <p className="mt-1.5 text-[14px] text-[#86868b]">
                      {noDocs
                        ? isEn
                          ? "Documents will appear here soon."
                          : "Dokümanlar yakında burada yer alacak."
                        : isEn
                          ? "Try a different search term or clear the filters."
                          : "Farklı bir arama deneyin veya filtreleri temizleyin."}
                    </p>
                    {!noDocs && (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="mt-5 text-[14px] font-semibold text-[#dc2626] transition-opacity hover:opacity-70"
                      >
                        {isEn ? "Clear filters" : "Filtreleri temizle"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
