import type { Metadata } from "next";
import { getRootCategories } from "@/lib/catalog";
import CategoryView from "./CategoryView";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    path: "/urunler",
    title: { tr: "Ürünler", en: "Products" },
    description: {
      tr: "Taytech ürün kategorileri: motor kontrol panoları, ısı istasyonları, enerji yönetim platformu ve daha fazlası.",
      en: "Taytech product categories: motor control panels, heat interface units, building management system and more.",
    },
  });
}

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
