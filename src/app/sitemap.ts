import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";
import { trToEn } from "@/lib/paths";

/**
 * Veritabanından beslenen iki dilli sitemap: her sayfanın Türkçe ve
 * İngilizce (/en/...) sürümü hreflang alternatifleriyle listelenir.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: { path: string; priority: number }[] = [
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
  ];

  /** TR + EN girdisi üretir; ikisi de birbirini hreflang ile gösterir. */
  const bilingual = (
    trPath: string,
    opts: {
      priority: number;
      changeFrequency: "weekly" | "monthly";
      lastModified?: Date;
    }
  ): MetadataRoute.Sitemap => {
    const enPath = trToEn(trPath);
    const trUrl = `${SITE_URL}${trPath === "/" ? "" : trPath}`;
    const enUrl = `${SITE_URL}${enPath}`;
    const languages = { tr: trUrl, en: enUrl, "x-default": trUrl };
    return [
      { url: trUrl, ...opts, alternates: { languages } },
      { url: enUrl, ...opts, alternates: { languages } },
    ];
  };

  return [
    ...staticRoutes.flatMap(({ path, priority }) =>
      bilingual(path, { priority, changeFrequency: "monthly" })
    ),
    ...categories.flatMap((c) =>
      bilingual(`/urunler/${c.slug}`, {
        priority: 0.7,
        changeFrequency: "weekly",
        lastModified: c.updatedAt,
      })
    ),
    ...products.flatMap((p) =>
      bilingual(`/urun/${p.slug}`, {
        priority: 0.8,
        changeFrequency: "weekly",
        lastModified: p.updatedAt,
      })
    ),
  ];
}
