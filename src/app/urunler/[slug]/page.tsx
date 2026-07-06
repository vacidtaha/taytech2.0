import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllCategorySlugs, getCategoryPage } from "@/lib/catalog";
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
  const cat = await getCategoryPage(slug);
  if (!cat) return {};

  const productNames = cat.products
    .slice(0, 4)
    .map((p) => p.nameTr)
    .join(", ");
  const description = productNames
    ? `Taytech ${cat.nameTr} ürünleri: ${productNames}. Teknik özellikler, dokümanlar ve detaylar.`
    : `Taytech ${cat.nameTr} kategorisindeki ürünleri, teknik özellikleri ve dokümanları inceleyin.`;

  return {
    title: cat.nameTr,
    description,
    alternates: { canonical: `/urunler/${slug}` },
    openGraph: {
      title: `${cat.nameTr} | Taytech`,
      description,
      url: `/urunler/${slug}`,
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
