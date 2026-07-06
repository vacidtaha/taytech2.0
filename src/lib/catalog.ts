import { prisma } from "@/lib/db";
import { menuTail, type MenuItem } from "@/app/lib/menu";

/**
 * Katalog veri erişim katmanı.
 *
 * Menü, ürün sayfaları ve doküman merkezi hepsi buradan beslenir; tek doğruluk
 * kaynağı veritabanıdır. Böylece panelden bir ürün eklenince/silinince menü ve
 * sayfalar kendiliğinden güncellenir (eski sitedeki "menüye elle ekleme" derdi biter).
 */

/** Kategori sayfası yolu. */
export function categoryHref(slug: string): string {
  return `/urunler/${slug}`;
}

/** Ürün detay sayfası yolu. */
export function productHref(slug: string): string {
  return `/urun/${slug}`;
}

/**
 * Menü ağacını veritabanından türetir.
 * Dönen dizi: [ "Ürünler" (DB kategori ağacı + ürünler), ...ürün-dışı statik başlıklar ]
 */
export async function getMenu(): Promise<MenuItem[]> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, slug: true, nameTr: true, nameEn: true, parentId: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        slug: true,
        nameTr: true,
        nameEn: true,
        categoryId: true,
        mainImageTr: true,
        mainImageEn: true,
      },
    }),
  ]);

  // parentId → alt kategoriler
  const childrenByParent = new Map<number | null, typeof categories>();
  for (const cat of categories) {
    const key = cat.parentId ?? null;
    const list = childrenByParent.get(key) ?? [];
    list.push(cat);
    childrenByParent.set(key, list);
  }

  // categoryId → ürünler
  const productsByCat = new Map<number | null, typeof products>();
  for (const p of products) {
    const key = p.categoryId ?? null;
    const list = productsByCat.get(key) ?? [];
    list.push(p);
    productsByCat.set(key, list);
  }

  // Alt ağaçtaki ilk ürün görseli (menü önizlemesi için)
  const firstImageFor = (id: number): string | null => {
    const ps = productsByCat.get(id);
    if (ps?.length) return ps[0].mainImageTr ?? ps[0].mainImageEn ?? null;
    for (const child of childrenByParent.get(id) ?? []) {
      const img = firstImageFor(child.id);
      if (img) return img;
    }
    return null;
  };

  const buildNode = (cat: (typeof categories)[number]): MenuItem => {
    const subCats = childrenByParent.get(cat.id) ?? [];
    const prods = productsByCat.get(cat.id) ?? [];
    const childNodes = subCats.map(buildNode);
    const children: MenuItem[] = [
      ...childNodes,
      ...prods.map((p) => ({
        label: p.nameTr,
        en: p.nameEn,
        href: productHref(p.slug),
        image: p.mainImageTr ?? p.mainImageEn ?? undefined,
      })),
    ];
    // Alt ağacında hiç ürün yoksa menüde tıklanamaz olsun.
    const hasProductsDeep =
      prods.length > 0 || childNodes.some((c) => !c.disabled);
    return {
      label: cat.nameTr,
      en: cat.nameEn,
      href: categoryHref(cat.slug),
      children: children.length ? children : undefined,
      disabled: hasProductsDeep ? undefined : true,
      image: firstImageFor(cat.id) ?? undefined,
    };
  };

  const roots = (childrenByParent.get(null) ?? []).map(buildNode);

  return [
    { label: "Ürünler", en: "Products", href: "/urunler", children: roots },
    ...menuTail,
  ];
}

/* ----------------------------- Ürün detayları ----------------------------- */

export type SpecTable = {
  name: string;
  /** İngilizce tablo adı; eski kayıtlarda bulunmayabilir. */
  nameEn?: string;
  data: string[][];
  /** İngilizce tablo içeriği; boşsa TR verisi gösterilir. */
  dataEn?: string[][];
};
export type GalleryItem = { url: string; urlEn: string | null };
export type ProductDocument = {
  nameTr: string;
  nameEn: string;
  type: string;
  url: string;
  urlEn: string | null;
};

export type ProductDetailData = {
  slug: string;
  nameTr: string;
  nameEn: string;
  descTr: string | null;
  descEn: string | null;
  mainImageTr: string | null;
  mainImageEn: string | null;
  appImageTr: string | null;
  appImageEn: string | null;
  specTables: SpecTable[];
  gallery: GalleryItem[];
  category: { slug: string; nameTr: string; nameEn: string } | null;
  documents: ProductDocument[];
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Tek bir ürünü (kategori + dokümanlar dahil) slug ile getirir. */
export async function getProductBySlug(
  slug: string
): Promise<ProductDetailData | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, nameTr: true, nameEn: true } },
      documents: { orderBy: { order: "asc" } },
    },
  });
  if (!p || !p.isActive) return null;

  return {
    slug: p.slug,
    nameTr: p.nameTr,
    nameEn: p.nameEn,
    descTr: p.descTr,
    descEn: p.descEn,
    mainImageTr: p.mainImageTr,
    mainImageEn: p.mainImageEn,
    appImageTr: p.appImageTr,
    appImageEn: p.appImageEn,
    specTables: safeParse<SpecTable[]>(p.specTable) ?? [],
    gallery: safeParse<GalleryItem[]>(p.gallery) ?? [],
    category: p.category
      ? { slug: p.category.slug, nameTr: p.category.nameTr, nameEn: p.category.nameEn }
      : null,
    documents: p.documents.map((d) => ({
      nameTr: d.nameTr,
      nameEn: d.nameEn,
      type: d.type,
      url: d.url,
      urlEn: d.urlEn,
    })),
  };
}

/** Statik üretim için tüm aktif ürün slug'ları. */
export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

/** Aynı kategorideki diğer aktif ürünler (mevcut ürün hariç). */
export async function getCategorySiblingProducts(
  categorySlug: string,
  excludeSlug: string
): Promise<ProductCard[]> {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true },
  });
  if (!category) return [];

  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: category.id,
      slug: { not: excludeSlug },
    },
    orderBy: { order: "asc" },
    select: {
      slug: true,
      nameTr: true,
      nameEn: true,
      mainImageTr: true,
      mainImageEn: true,
    },
  });

  return rows.map((p) => ({
    slug: p.slug,
    nameTr: p.nameTr,
    nameEn: p.nameEn,
    imageTr: p.mainImageTr,
    imageEn: p.mainImageEn,
  }));
}

/* ---------------------------- Kategori sayfaları --------------------------- */

export type CategoryCard = {
  slug: string;
  nameTr: string;
  nameEn: string;
  productCount: number;
  image: string | null;
};

export type ProductCard = {
  slug: string;
  nameTr: string;
  nameEn: string;
  imageTr: string | null;
  imageEn: string | null;
};

export type CategoryPageData = {
  slug: string;
  nameTr: string;
  nameEn: string;
  ancestors: { slug: string; nameTr: string; nameEn: string }[];
  subcategories: CategoryCard[];
  products: ProductCard[];
};

async function loadTree() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, slug: true, nameTr: true, nameEn: true, parentId: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        slug: true,
        nameTr: true,
        nameEn: true,
        categoryId: true,
        mainImageTr: true,
        mainImageEn: true,
      },
    }),
  ]);

  const byId = new Map(categories.map((c) => [c.id, c]));
  const childrenByParent = new Map<number | null, typeof categories>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    const list = childrenByParent.get(key) ?? [];
    list.push(c);
    childrenByParent.set(key, list);
  }
  const productsByCat = new Map<number | null, typeof products>();
  for (const p of products) {
    const key = p.categoryId ?? null;
    const list = productsByCat.get(key) ?? [];
    list.push(p);
    productsByCat.set(key, list);
  }

  // Bir kategori (ve tüm alt ağacı) altındaki ürün sayısı
  const countFor = (id: number): number => {
    let n = productsByCat.get(id)?.length ?? 0;
    for (const child of childrenByParent.get(id) ?? []) n += countFor(child.id);
    return n;
  };
  // Alt ağaçtaki ilk ürün görseli (kart önizlemesi için)
  const firstImageFor = (id: number): string | null => {
    const ps = productsByCat.get(id);
    if (ps?.length) return ps[0].mainImageTr ?? ps[0].mainImageEn ?? null;
    for (const child of childrenByParent.get(id) ?? []) {
      const img = firstImageFor(child.id);
      if (img) return img;
    }
    return null;
  };

  const toCard = (c: (typeof categories)[number]): CategoryCard => ({
    slug: c.slug,
    nameTr: c.nameTr,
    nameEn: c.nameEn,
    productCount: countFor(c.id),
    image: firstImageFor(c.id),
  });

  return { categories, byId, childrenByParent, productsByCat, toCard };
}

/** Bir kategori sayfası: alt kategoriler + doğrudan ürünler + üst kırıntı. */
export async function getCategoryPage(
  slug: string
): Promise<CategoryPageData | null> {
  const { categories, byId, childrenByParent, productsByCat, toCard } =
    await loadTree();

  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return null;

  const ancestors: CategoryPageData["ancestors"] = [];
  let cur = cat.parentId ? byId.get(cat.parentId) : undefined;
  while (cur) {
    ancestors.unshift({ slug: cur.slug, nameTr: cur.nameTr, nameEn: cur.nameEn });
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }

  const subcategories = (childrenByParent.get(cat.id) ?? []).map(toCard);
  const products = (productsByCat.get(cat.id) ?? []).map((p) => ({
    slug: p.slug,
    nameTr: p.nameTr,
    nameEn: p.nameEn,
    imageTr: p.mainImageTr,
    imageEn: p.mainImageEn,
  }));

  return {
    slug: cat.slug,
    nameTr: cat.nameTr,
    nameEn: cat.nameEn,
    ancestors,
    subcategories,
    products,
  };
}

export type ShowcaseProduct = ProductCard & {
  /** Açıklamadan çıkarılmış kısa düz metin özeti (başlık/madde işaretleri temizlenmiş). */
  excerptTr: string | null;
  excerptEn: string | null;
};

/** Açıklama metninden kart özeti üretir: başlıkları atlar, ilk anlamlı cümleleri alır. */
function excerptOf(desc: string | null, maxLen = 150): string | null {
  if (!desc) return null;
  const isHeading = (line: string) =>
    /[a-zçğıöşü]/i.test(line) &&
    line === line.toLocaleUpperCase("tr-TR") &&
    !line.includes(":") &&
    line.length <= 60;

  const parts: string[] = [];
  for (const raw of desc.split("\n")) {
    const line = raw.trim();
    if (!line || isHeading(line) || line.includes("|")) continue;
    parts.push(line.replace(/^[•-]\s*/, ""));
    if (parts.join(" ").length >= maxLen) break;
  }
  const joined = parts.join(" ").trim();
  if (!joined) return null;
  if (joined.length <= maxLen) return joined;
  return `${joined.slice(0, maxLen).replace(/\s+\S*$/, "")}…`;
}

/** Bir kategorinin (alt kategorileri dahil) tüm aktif ürünleri — vitrin şeritleri için. */
export async function getCategoryProductsDeep(
  slug: string,
  options?: { excludeSlugs?: string[] },
): Promise<ShowcaseProduct[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true, parentId: true },
  });
  const root = categories.find((c) => c.slug === slug);
  if (!root) return [];

  const excluded = new Set(options?.excludeSlugs ?? []);

  const childrenByParent = new Map<number | null, typeof categories>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    const list = childrenByParent.get(key) ?? [];
    list.push(c);
    childrenByParent.set(key, list);
  }
  const ids: number[] = [];
  const stack = [root.id];
  while (stack.length) {
    const cur = stack.pop()!;
    ids.push(cur);
    for (const child of childrenByParent.get(cur) ?? []) {
      // Hariç tutulan dal (ör. Smart Serisi) ve altındakiler atlanır
      if (excluded.has(child.slug)) continue;
      stack.push(child.id);
    }
  }

  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId: { in: ids } },
    orderBy: { order: "asc" },
    select: {
      slug: true,
      nameTr: true,
      nameEn: true,
      mainImageTr: true,
      mainImageEn: true,
      descTr: true,
      descEn: true,
    },
  });

  return products.map((p) => ({
    slug: p.slug,
    nameTr: p.nameTr,
    nameEn: p.nameEn,
    imageTr: p.mainImageTr,
    imageEn: p.mainImageEn,
    excerptTr: excerptOf(p.descTr),
    excerptEn: excerptOf(p.descEn),
  }));
}

/** "/urunler" giriş sayfası için kök kategoriler. */
export async function getRootCategories(): Promise<CategoryCard[]> {
  const { childrenByParent, toCard } = await loadTree();
  return (childrenByParent.get(null) ?? []).map(toCard);
}

/** Statik üretim için tüm kategori slug'ları. */
export async function getAllCategorySlugs(): Promise<string[]> {
  const rows = await prisma.category.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

/* ------------------------------ Admin (panel) ----------------------------- */

export type CategoryOption = {
  id: number;
  depth: number;
  /** Ağaç sırasına göre girintili tam yol etiketi (TR). */
  labelTr: string;
  labelEn: string;
};

/** Panel form seçimleri için kategori ağacını düz (sıralı + girintili) listeye çevirir. */
export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, nameTr: true, nameEn: true, parentId: true },
  });

  const childrenByParent = new Map<number | null, typeof categories>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    const list = childrenByParent.get(key) ?? [];
    list.push(c);
    childrenByParent.set(key, list);
  }

  const out: CategoryOption[] = [];
  const walk = (parentId: number | null, depth: number) => {
    for (const c of childrenByParent.get(parentId) ?? []) {
      out.push({ id: c.id, depth, labelTr: c.nameTr, labelEn: c.nameEn });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export type AdminCategory = {
  id: number;
  slug: string;
  nameTr: string;
  nameEn: string;
  parentId: number | null;
  order: number;
  /** Doğrudan bu kategoriye bağlı ürün sayısı. */
  directProductCount: number;
  /** Alt kategoriler dahil toplam ürün sayısı. */
  totalProductCount: number;
  childCount: number;
};

/** Panel kategori ağacı: tüm kategoriler, sıra + ürün sayımlarıyla (düz liste). */
export async function getAdminCategories(): Promise<AdminCategory[]> {
  const [categories, grouped] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      select: { id: true, slug: true, nameTr: true, nameEn: true, parentId: true, order: true },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      _count: { _all: true },
    }),
  ]);

  const directCount = new Map<number, number>();
  for (const g of grouped) {
    if (g.categoryId != null) directCount.set(g.categoryId, g._count._all);
  }

  const childrenByParent = new Map<number | null, typeof categories>();
  for (const c of categories) {
    const key = c.parentId ?? null;
    const list = childrenByParent.get(key) ?? [];
    list.push(c);
    childrenByParent.set(key, list);
  }

  const totalFor = (id: number): number => {
    let n = directCount.get(id) ?? 0;
    for (const child of childrenByParent.get(id) ?? []) n += totalFor(child.id);
    return n;
  };

  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameTr: c.nameTr,
    nameEn: c.nameEn,
    parentId: c.parentId,
    order: c.order,
    directProductCount: directCount.get(c.id) ?? 0,
    totalProductCount: totalFor(c.id),
    childCount: (childrenByParent.get(c.id) ?? []).length,
  }));
}

export type ProductEditData = {
  id: number;
  slug: string;
  isActive: boolean;
  nameTr: string;
  nameEn: string;
  descTr: string;
  descEn: string;
  categoryId: number | null;
  mainImageTr: string;
  mainImageEn: string;
  appImageTr: string;
  appImageEn: string;
  specTables: { name: string; nameEn: string; data: string[][]; dataEn: string[][] }[];
  gallery: { url: string; urlEn: string }[];
  documents: {
    type: string;
    nameTr: string;
    nameEn: string;
    url: string;
    urlEn: string;
  }[];
};

/** Panel düzenleme formu için bir ürünün tüm alanları (aktif/pasif fark etmez). */
export async function getProductForEdit(id: number): Promise<ProductEditData | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: { documents: { orderBy: { order: "asc" } } },
  });
  if (!p) return null;

  return {
    id: p.id,
    slug: p.slug,
    isActive: p.isActive,
    nameTr: p.nameTr,
    nameEn: p.nameEn,
    descTr: p.descTr ?? "",
    descEn: p.descEn ?? "",
    categoryId: p.categoryId,
    mainImageTr: p.mainImageTr ?? "",
    mainImageEn: p.mainImageEn ?? "",
    appImageTr: p.appImageTr ?? "",
    appImageEn: p.appImageEn ?? "",
    specTables: (safeParse<SpecTable[]>(p.specTable) ?? []).map((t) => ({
      name: t.name ?? "",
      nameEn: t.nameEn ?? "",
      data: t.data ?? [],
      dataEn: t.dataEn ?? [],
    })),
    gallery: (safeParse<GalleryItem[]>(p.gallery) ?? []).map((g) => ({
      url: g.url,
      urlEn: g.urlEn ?? "",
    })),
    documents: p.documents.map((d) => ({
      type: d.type,
      nameTr: d.nameTr,
      nameEn: d.nameEn,
      url: d.url,
      urlEn: d.urlEn ?? "",
    })),
  };
}

/* ----------------------------- Doküman Merkezi ---------------------------- */

export type DocumentItem = {
  id: number;
  nameTr: string;
  nameEn: string;
  url: string;
  urlEn: string | null;
  type: string;
  productSlug: string;
  productNameTr: string;
  productNameEn: string;
  categoryNameTr: string;
  categoryNameEn: string;
  topCategoryNameTr: string;
  topCategoryNameEn: string;
};

/** Tüm dokümanlar (ürünü + kategorisi + kök kategorisi adlarıyla). */
export async function getAllDocuments(): Promise<DocumentItem[]> {
  const [docs, categories] = await Promise.all([
    prisma.document.findMany({
      orderBy: [{ productId: "asc" }, { order: "asc" }],
      include: {
        product: {
          select: {
            slug: true,
            nameTr: true,
            nameEn: true,
            isActive: true,
            categoryId: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      select: { id: true, nameTr: true, nameEn: true, parentId: true },
    }),
  ]);

  const byId = new Map(categories.map((c) => [c.id, c]));
  const rootOf = (id: number) => {
    let cur = byId.get(id);
    while (cur && cur.parentId != null) cur = byId.get(cur.parentId);
    return cur ?? null;
  };

  return docs
    .filter((d) => d.product.isActive)
    .map((d) => {
      const cat = d.product.categoryId ? byId.get(d.product.categoryId) : null;
      const root = cat ? rootOf(cat.id) : null;
      return {
        id: d.id,
        nameTr: d.nameTr,
        nameEn: d.nameEn,
        url: d.url,
        urlEn: d.urlEn,
        type: d.type,
        productSlug: d.product.slug,
        productNameTr: d.product.nameTr,
        productNameEn: d.product.nameEn,
        categoryNameTr: cat?.nameTr ?? "",
        categoryNameEn: cat?.nameEn ?? "",
        topCategoryNameTr: root?.nameTr ?? "",
        topCategoryNameEn: root?.nameEn ?? "",
      };
    });
}
