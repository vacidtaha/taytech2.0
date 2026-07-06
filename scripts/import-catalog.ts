/**
 * Tek seferlik (idempotent) katalog importer.
 *
 * taytech-export paketindeki kategoriler.json + urunler.json dosyalarını
 * (prisma/seed-data/ altına kopyalanmış hâlleri) SQLite veritabanına yazar.
 *
 * Çalıştırma:  npm run db:import
 *
 * Not: Her çalıştırmada mevcut Category/Product/Document kayıtlarını silip
 * baştan yazar; bu yüzden tekrar çalıştırmak güvenlidir.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(thisDir, "..", "prisma", "seed-data");

type LangText = { tr: string; en: string };
type CatNode = { slug: string; ad: LangText; cocuklar?: CatNode[] };
type DocInput = { ad: LangText; tip: string; url: string; urlEn: string | null };
type GalleryItem = { url: string; urlEn: string | null };
type ProductInput = {
  slug: string;
  kategoriSlug?: string;
  isActive?: boolean;
  ad: LangText;
  aciklama?: LangText;
  anaGorsel?: { tr: string | null; en: string | null };
  uygulamaGorseli?: { tr: string | null; en: string | null };
  teknikTablo?: unknown;
  galeri?: GalleryItem[];
  dokumanlar?: DocInput[];
};

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(dataDir, file), "utf-8")) as T;
}

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./taytech.db",
  });
  const prisma = new PrismaClient({ adapter });

  const categories = readJson<CatNode[]>("kategoriler.json");
  const products = readJson<ProductInput[]>("urunler.json");

  // 1) Temizle (FK sırasına dikkat: Document → Product → Category)
  await prisma.document.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2) Kategori ağacını yaz, slug → id haritası kur
  const slugToId = new Map<string, number>();
  let catCount = 0;

  async function insertCat(node: CatNode, parentId: number | null, order: number) {
    const created = await prisma.category.create({
      data: {
        slug: node.slug,
        nameTr: node.ad.tr,
        nameEn: node.ad.en,
        parentId,
        order,
      },
    });
    slugToId.set(node.slug, created.id);
    catCount++;
    const kids = node.cocuklar ?? [];
    for (let i = 0; i < kids.length; i++) {
      await insertCat(kids[i], created.id, i);
    }
  }

  for (let i = 0; i < categories.length; i++) {
    await insertCat(categories[i], null, i);
  }

  // 3) Ürünleri + dokümanları yaz
  let prodCount = 0;
  let docCount = 0;
  const missingCat: string[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const categoryId = p.kategoriSlug ? slugToId.get(p.kategoriSlug) ?? null : null;
    if (p.kategoriSlug && categoryId === null) {
      missingCat.push(`${p.slug} → ${p.kategoriSlug}`);
    }

    const created = await prisma.product.create({
      data: {
        slug: p.slug,
        order: i,
        isActive: p.isActive ?? true,
        nameTr: p.ad.tr,
        nameEn: p.ad.en,
        descTr: p.aciklama?.tr ?? null,
        descEn: p.aciklama?.en ?? null,
        mainImageTr: p.anaGorsel?.tr ?? null,
        mainImageEn: p.anaGorsel?.en ?? null,
        appImageTr: p.uygulamaGorseli?.tr ?? null,
        appImageEn: p.uygulamaGorseli?.en ?? null,
        specTable: p.teknikTablo ? JSON.stringify(p.teknikTablo) : null,
        gallery: p.galeri ? JSON.stringify(p.galeri) : null,
        categoryId,
      },
    });
    prodCount++;

    const docs = p.dokumanlar ?? [];
    for (let d = 0; d < docs.length; d++) {
      const doc = docs[d];
      await prisma.document.create({
        data: {
          productId: created.id,
          type: doc.tip,
          nameTr: doc.ad.tr,
          nameEn: doc.ad.en,
          url: doc.url,
          urlEn: doc.urlEn ?? null,
          order: d,
        },
      });
      docCount++;
    }
  }

  console.log("Import tamamlandı:");
  console.log(
    JSON.stringify(
      { categories: catCount, products: prodCount, documents: docCount },
      null,
      2
    )
  );
  if (missingCat.length) {
    console.warn(`\nUyarı: kategorisi bulunamayan ${missingCat.length} ürün:`);
    missingCat.forEach((m) => console.warn("  - " + m));
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
