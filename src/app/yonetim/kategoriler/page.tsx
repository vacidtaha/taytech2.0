import type { Metadata } from "next";
import { getAdminCategories } from "@/lib/catalog";
import CategoriesAdmin from "./CategoriesAdmin";

export const metadata: Metadata = {
  title: "Kategoriler",
  robots: { index: false, follow: false },
};

export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoriesAdmin categories={categories} />;
}
