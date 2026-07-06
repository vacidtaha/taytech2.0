import type { Metadata } from "next";
import { getAdminCategories } from "@/lib/catalog";
import ProductForm from "../ProductForm";

export const metadata: Metadata = {
  title: "Yeni Ürün",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return <ProductForm mode="create" categories={categories} />;
}
