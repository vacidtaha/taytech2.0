import type { Metadata } from "next";
import { getRootCategories } from "@/lib/catalog";
import CategoryView from "./CategoryView";

export const metadata: Metadata = {
  title: "Ürünler",
  description:
    "Taytech ürün kategorileri: motor kontrol panoları, ısı istasyonları, enerji yönetim platformu ve daha fazlası.",
  alternates: { canonical: "/urunler" },
};

export default async function ProductsPage() {
  const roots = await getRootCategories();
  return (
    <CategoryView
      nameTr="Ürünler"
      nameEn="Products"
      ancestors={[]}
      subcategories={roots}
      products={[]}
      isRoot
    />
  );
}
