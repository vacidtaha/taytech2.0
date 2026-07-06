import { prisma } from "@/lib/db";
import ProductsAdmin, { type ProductFilter } from "./ProductsAdmin";

export const dynamic = "force-dynamic";

const FILTERS: ProductFilter[] = ["kategorisiz", "gorselsiz", "dokumansiz", "pasif"];

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const initialFilter: ProductFilter = FILTERS.includes(filtre as ProductFilter)
    ? (filtre as ProductFilter)
    : "all";

  const rows = await prisma.product.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      nameTr: true,
      nameEn: true,
      descTr: true,
      descEn: true,
      isActive: true,
      order: true,
      mainImageTr: true,
      mainImageEn: true,
      category: { select: { nameTr: true } },
      _count: { select: { documents: true } },
    },
  });

  const products = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    nameTr: p.nameTr,
    nameEn: p.nameEn,
    // Arama için; tabloya basılmaz (payload'ı küçük tutmak adına kısaltılır)
    desc: `${p.descTr ?? ""}\n${p.descEn ?? ""}`.slice(0, 2000).toLowerCase(),
    isActive: p.isActive,
    order: p.order,
    image: p.mainImageTr ?? p.mainImageEn ?? null,
    categoryName: p.category?.nameTr ?? null,
    documentCount: p._count.documents,
  }));

  return <ProductsAdmin products={products} initialFilter={initialFilter} />;
}
