import type { Locale } from "@/app/locales/contact";

/**
 * İki dilli URL eşleme tablosu.
 * Türkçe yollar sitenin "gerçek" rotalarıdır; İngilizce yollar /en öneki
 * altında yaşar ve proxy tarafından Türkçe rotalara rewrite edilir.
 * Ürün/kategori slug'ları her iki dilde de aynıdır (zaten İngilizce).
 */

/** Statik sayfalar: TR yol → EN yol. */
const STATIC_TR_TO_EN: Record<string, string> = {
  "/": "/en",
  "/urunler": "/en/products",
  "/cozumler": "/en/solutions",
  "/kurumsal": "/en/corporate",
  "/iletisim": "/en/contact",
  "/dokuman-merkezi": "/en/document-center",
  "/bilgi-merkezi/sikca-sorulan-sorular": "/en/knowledge-center/faq",
  "/bilgi-merkezi/video-arsivi": "/en/knowledge-center/video-archive",
  "/bilgi-merkezi/taytech-akademi": "/en/knowledge-center/taytech-academy",
};

/** Çözüm sayfaları: TR slug → EN slug. */
const SOLUTION_TR_TO_EN: Record<string, string> = {
  "ticari-tesisler": "commercial-facilities",
  "toplu-konutlar": "residential-complexes",
  "bakim-huzur-evleri": "care-and-nursing-homes",
  hastaneler: "hospitals",
  "endustriyel-kazan-dairesi": "industrial-boiler-rooms",
  "spor-eglence-tesisleri": "sports-and-leisure-facilities",
  "saha-disi-uretim": "offsite-manufacturing",
  "egitim-yapilari": "educational-buildings",
  "yeni-projeler": "new-projects",
};

const STATIC_EN_TO_TR: Record<string, string> = Object.fromEntries(
  Object.entries(STATIC_TR_TO_EN).map(([tr, en]) => [en, tr])
);

const SOLUTION_EN_TO_TR: Record<string, string> = Object.fromEntries(
  Object.entries(SOLUTION_TR_TO_EN).map(([tr, en]) => [en, tr])
);

export function isEnPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}

/** Türkçe yolu İngilizce karşılığına çevirir. */
export function trToEn(pathname: string): string {
  if (isEnPath(pathname)) return pathname;
  const clean = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";

  const staticHit = STATIC_TR_TO_EN[clean];
  if (staticHit) return staticHit;

  if (clean.startsWith("/urun/")) {
    return `/en/product/${clean.slice("/urun/".length)}`;
  }
  if (clean.startsWith("/urunler/")) {
    return `/en/products/${clean.slice("/urunler/".length)}`;
  }
  if (clean.startsWith("/cozumler/")) {
    const slug = clean.slice("/cozumler/".length);
    return `/en/solutions/${SOLUTION_TR_TO_EN[slug] ?? slug}`;
  }
  // Eşleşme yoksa genel önek (yönetim/api linkleri buraya düşmez).
  return `/en${clean}`;
}

/** İngilizce (/en...) yolu Türkçe karşılığına çevirir. */
export function enToTr(pathname: string): string {
  if (!isEnPath(pathname)) return pathname;
  const clean = pathname !== "/en" ? pathname.replace(/\/+$/, "") : "/en";

  const staticHit = STATIC_EN_TO_TR[clean];
  if (staticHit) return staticHit;

  if (clean.startsWith("/en/product/")) {
    return `/urun/${clean.slice("/en/product/".length)}`;
  }
  if (clean.startsWith("/en/products/")) {
    return `/urunler/${clean.slice("/en/products/".length)}`;
  }
  if (clean.startsWith("/en/solutions/")) {
    const slug = clean.slice("/en/solutions/".length);
    return `/cozumler/${SOLUTION_EN_TO_TR[slug] ?? slug}`;
  }
  return clean.slice("/en".length) || "/";
}

/** Verilen (Türkçe) yolu istenen dile göre döndürür. */
export function localizePath(pathname: string, locale: Locale): string {
  if (locale === "EN") return trToEn(pathname);
  return enToTr(pathname);
}
