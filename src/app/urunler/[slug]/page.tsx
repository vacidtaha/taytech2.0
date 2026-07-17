import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCategorySlugs, getCategoryPage } from "@/lib/catalog";
import { requestIsEn } from "@/lib/i18n-meta";
import CategoryView from "../CategoryView";

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [cat, isEn] = await Promise.all([getCategoryPage(slug), requestIsEn()]);
  if (!cat) return {};

  const name = isEn ? cat.nameEn : cat.nameTr;
  const productNames = cat.products
    .slice(0, 4)
    .map((p) => (isEn ? p.nameEn : p.nameTr))
    .join(", ");
  const description = isEn
    ? productNames
      ? `Taytech ${name} products: ${productNames}. Technical features, documents and details.`
      : `Explore Taytech ${name} products, technical features and documents.`
    : productNames
      ? `Taytech ${name} ürünleri: ${productNames}. Teknik özellikler, dokümanlar ve detaylar.`
      : `Taytech ${name} kategorisindeki ürünleri, teknik özellikleri ve dokümanları inceleyin.`;
  const trPath = `/urunler/${slug}`;
  const enPath = `/en/products/${slug}`;

  return {
    title: name,
    description,
    alternates: {
      canonical: isEn ? enPath : trPath,
      languages: { tr: trPath, en: enPath, "x-default": trPath },
    },
    openGraph: {
      title: `${name} | Taytech`,
      description,
      url: isEn ? enPath : trPath,
      locale: isEn ? "en_GB" : "tr_TR",
      images: [{ url: "/og.png" }],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = await getCategoryPage(slug);
  if (!cat) notFound();

  return (
    <CategoryView
      nameTr={cat.nameTr}
      nameEn={cat.nameEn}
      ancestors={cat.ancestors}
      subcategories={cat.subcategories}
      products={cat.products}
    />
  );
}
