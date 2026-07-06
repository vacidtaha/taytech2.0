import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllProductSlugs, getCategorySiblingProducts, getProductBySlug } from "@/lib/catalog";
import { SITE_URL, metaDescription } from "@/lib/site";
import ProductDetail from "./ProductDetail";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description = metaDescription(product.descTr ?? "");
  const image = product.mainImageTr ?? product.gallery[0]?.url;

  return {
    title: product.nameTr,
    description: description || undefined,
    alternates: { canonical: `/urun/${slug}` },
    openGraph: {
      title: `${product.nameTr} | Taytech`,
      description: description || undefined,
      url: `/urun/${slug}`,
      images: image ? [{ url: image }] : [{ url: "/og.png" }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = product.category
    ? await getCategorySiblingProducts(product.category.slug, slug)
    : [];

  const image = product.mainImageTr ?? product.gallery[0]?.url;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameTr,
    description: metaDescription(product.descTr ?? "", 300) || undefined,
    url: `${SITE_URL}/urun/${slug}`,
    ...(image ? { image: `${SITE_URL}${image}` } : {}),
    brand: { "@type": "Brand", name: "Taytech" },
    manufacturer: {
      "@type": "Organization",
      name: "Taytech Enerji Teknolojileri San. ve Tic. A.Ş.",
    },
    ...(product.category
      ? { category: product.category.nameTr }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ürünler",
        item: `${SITE_URL}/urunler`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: product.category.nameTr,
              item: `${SITE_URL}/urunler/${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 3 : 2,
        name: product.nameTr,
        item: `${SITE_URL}/urun/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </>
  );
}
