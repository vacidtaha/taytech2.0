import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCategories, getProductForEdit } from "@/lib/catalog";
import ProductForm from "../ProductForm";

export const metadata: Metadata = {
  title: "Ürün Düzenle",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [product, categories] = await Promise.all([
    getProductForEdit(id),
    getAdminCategories(),
  ]);
  if (!product) notFound();

  return <ProductForm mode="edit" categories={categories} product={product} />;
}
