/**
 * Ürün form verisinin sunucu tarafı doğrulaması ve normalleştirilmesi.
 * Hem oluşturma (POST) hem güncelleme (PUT) uçları bunu kullanır.
 */

export const DOCUMENT_TYPES = [
  "katalog",
  "teknik",
  "kilavuz",
  "sertifika",
  "cad",
] as const;

export type SpecTableInput = {
  name: string;
  nameEn: string;
  data: string[][];
  /** İngilizce tablo içeriği; boşsa sitede TR verisi gösterilir. */
  dataEn: string[][];
};
export type GalleryInput = { url: string; urlEn: string | null };
export type DocumentInput = {
  type: string;
  nameTr: string;
  nameEn: string;
  url: string;
  urlEn: string | null;
};

export type ProductInput = {
  slug: string;
  nameTr: string;
  nameEn: string;
  descTr: string | null;
  descEn: string | null;
  /** Teknik özellikler: satır başına bir madde; ";"/":" ile biten satır grup
   * başlığı, tab ile başlayan satır alt maddedir. */
  featuresTr: string | null;
  featuresEn: string | null;
  categoryId: number | null;
  isActive: boolean;
  mainImageTr: string | null;
  mainImageEn: string | null;
  appImageTr: string | null;
  appImageEn: string | null;
  specTables: SpecTableInput[];
  gallery: GalleryInput[];
  documents: DocumentInput[];
};

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}
function strOrNull(v: unknown): string | null {
  const s = str(v);
  return s.length ? s : null;
}

export type ParseResult =
  | { ok: true; data: ProductInput }
  | { ok: false; error: string };

export function parseProductInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Geçersiz veri." };
  }
  const b = body as Record<string, unknown>;

  const nameTr = str(b.nameTr);
  const nameEn = str(b.nameEn);
  if (!nameTr) return { ok: false, error: "Türkçe ürün adı zorunludur." };
  if (!nameEn) return { ok: false, error: "İngilizce ürün adı zorunludur." };

  let slug = slugify(str(b.slug) || nameTr);
  if (!slug) return { ok: false, error: "Geçerli bir slug üretilemedi." };

  let categoryId: number | null = null;
  if (b.categoryId != null && b.categoryId !== "") {
    const n = Number(b.categoryId);
    if (!Number.isInteger(n) || n <= 0) {
      return { ok: false, error: "Geçersiz kategori." };
    }
    categoryId = n;
  }

  // Teknik tablolar
  const parseGrid = (raw: unknown): string[][] =>
    (Array.isArray(raw) ? raw : [])
      .filter((r): r is unknown[] => Array.isArray(r))
      .map((row) => row.map((cell) => (typeof cell === "string" ? cell : String(cell ?? ""))))
      .filter((row) => row.some((c) => c.trim().length > 0));

  const specTables: SpecTableInput[] = [];
  if (Array.isArray(b.specTables)) {
    for (const t of b.specTables) {
      if (!t || typeof t !== "object") continue;
      const tt = t as Record<string, unknown>;
      const name = str(tt.name);
      const nameEn = str(tt.nameEn);
      const data = parseGrid(tt.data);
      const dataEn = parseGrid(tt.dataEn);
      if (name || nameEn || data.length || dataEn.length) {
        specTables.push({ name, nameEn, data, dataEn });
      }
    }
  }

  // Galeri — yalnız EN görseli olan kayıtlar da geçerli (İngiltere'ye özel ürün
  // görselleri); TR sayfası boş url'li kayıtları atlar.
  const gallery: GalleryInput[] = [];
  if (Array.isArray(b.gallery)) {
    for (const g of b.gallery) {
      if (!g || typeof g !== "object") continue;
      const gg = g as Record<string, unknown>;
      const url = str(gg.url);
      const urlEn = strOrNull(gg.urlEn);
      if (!url && !urlEn) continue;
      gallery.push({ url, urlEn });
    }
  }

  // Dokümanlar
  const documents: DocumentInput[] = [];
  if (Array.isArray(b.documents)) {
    for (const d of b.documents) {
      if (!d || typeof d !== "object") continue;
      const dd = d as Record<string, unknown>;
      const url = str(dd.url);
      const nameTrD = str(dd.nameTr);
      if (!url || !nameTrD) continue; // en az ad(tr) + dosya
      const type = str(dd.type) || "teknik";
      documents.push({
        type: (DOCUMENT_TYPES as readonly string[]).includes(type) ? type : "teknik",
        nameTr: nameTrD,
        nameEn: str(dd.nameEn) || nameTrD,
        url,
        urlEn: strOrNull(dd.urlEn),
      });
    }
  }

  return {
    ok: true,
    data: {
      slug,
      nameTr,
      nameEn,
      descTr: strOrNull(b.descTr),
      descEn: strOrNull(b.descEn),
      featuresTr: strOrNull(b.featuresTr),
      featuresEn: strOrNull(b.featuresEn),
      categoryId,
      isActive: b.isActive !== false,
      mainImageTr: strOrNull(b.mainImageTr),
      mainImageEn: strOrNull(b.mainImageEn),
      appImageTr: strOrNull(b.appImageTr),
      appImageEn: strOrNull(b.appImageEn),
      specTables,
      gallery,
      documents,
    },
  };
}

/** ProductInput → Prisma product data (JSON alanlar string'e çevrilir). */
export function toPrismaData(input: ProductInput) {
  return {
    slug: input.slug,
    nameTr: input.nameTr,
    nameEn: input.nameEn,
    descTr: input.descTr,
    descEn: input.descEn,
    featuresTr: input.featuresTr,
    featuresEn: input.featuresEn,
    categoryId: input.categoryId,
    isActive: input.isActive,
    mainImageTr: input.mainImageTr,
    mainImageEn: input.mainImageEn,
    appImageTr: input.appImageTr,
    appImageEn: input.appImageEn,
    specTable: input.specTables.length ? JSON.stringify(input.specTables) : null,
    gallery: input.gallery.length ? JSON.stringify(input.gallery) : null,
  };
}
