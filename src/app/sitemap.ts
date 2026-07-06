import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

/**
 * Veritabanından beslenen sitemap: yeni ürün/kategori eklendiğinde
 * revalidate sonrası otomatik olarak listeye girer.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1 },
    { path: "/urunler", priority: 0.9 },
    { path: "/kurumsal", priority: 0.8 },
    { path: "/cozumler", priority: 0.8 },
    { path: "/cozumler/ticari-tesisler", priority: 0.6 },
    { path: "/cozumler/toplu-konutlar", priority: 0.6 },
    { path: "/cozumler/bakim-huzur-evleri", priority: 0.6 },
    { path: "/cozumler/hastaneler", priority: 0.6 },
    { path: "/cozumler/endustriyel-kazan-dairesi", priority: 0.6 },
    { path: "/cozumler/spor-eglence-tesisleri", priority: 0.6 },
    { path: "/cozumler/saha-disi-uretim", priority: 0.6 },
    { path: "/cozumler/egitim-yapilari", priority: 0.6 },
    { path: "/cozumler/yeni-projeler", priority: 0.6 },
    { path: "/dokuman-merkezi", priority: 0.7 },
    { path: "/bilgi-merkezi/sikca-sorulan-sorular", priority: 0.6 },
    { path: "/bilgi-merkezi/video-arsivi", priority: 0.4 },
    { path: "/bilgi-merkezi/taytech-akademi", priority: 0.4 },
    { path: "/iletisim", priority: 0.7 },
  ].map(({ path, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "monthly" as const,
    priority,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/urunler/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/urun/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
