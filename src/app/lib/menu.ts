export type MenuItem = {
  label: string;
  en?: string;
  href?: string;
  children?: MenuItem[];
  /** İçinde hiç ürün olmayan kategori: menüde görünür ama tıklanamaz. */
  disabled?: boolean;
  /** Menüde öğenin altında gösterilen önizleme görseli (ürün fotoğrafı). */
  image?: string;
};

/**
 * Ürün-dışı üst menü başlıkları (statik).
 * "Ürünler" dalı buraya dahil DEĞİL; o dal veritabanından türetilir
 * (bkz. src/lib/catalog.ts → getMenu). Nihai menü:  [Ürünler(DB), ...menuTail]
 */
export const menuTail: MenuItem[] = [
  { label: "Çözümler", en: "Solutions", href: "/cozumler" },
  { label: "Doküman Merkezi", en: "Document Centre", href: "/dokuman-merkezi" },
  {
    label: "Bilgi Merkezi",
    en: "Knowledge Centre",
    href: "/bilgi-merkezi",
    children: [
      { label: "SSS", en: "FAQ", href: "/bilgi-merkezi/sikca-sorulan-sorular" },
      { label: "Doküman Merkezi", en: "Document Centre", href: "/dokuman-merkezi" },
      { label: "Teknik Destek", en: "Technical Support", href: "/iletisim" },
      { label: "Taytech Akademi", en: "Taytech Academy", href: "/bilgi-merkezi/taytech-akademi" },
      { label: "Video Arşivi", en: "Video Archive", href: "/bilgi-merkezi/video-arsivi" },
    ],
  },
  { label: "Kurumsal", en: "Corporate", href: "/kurumsal" },
  { label: "İletişim", en: "Contact", href: "/iletisim" },
];

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveHref(item: MenuItem, parentHref: string): string {
  return item.href ?? `${parentHref}/${slugify(item.label)}`;
}
