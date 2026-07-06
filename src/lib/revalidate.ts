import { revalidatePath } from "next/cache";

/**
 * Katalog (ürün/kategori/doküman) değişince herkese açık sayfaları tazeler.
 *
 * Menü kök layout'ta olduğu ve neredeyse tüm sayfaları etkilediği için
 * kök layout ağacını tümden yeniden doğrularız — küçük bir katalog sitesi için
 * en sağlam ve basit yaklaşım. Böylece menü, /urunler, /urunler/[slug],
 * /urun/[slug] ve /dokuman-merkezi anında güncellenir.
 */
export function revalidateCatalog(): void {
  revalidatePath("/", "layout");
}
