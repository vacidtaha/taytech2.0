import { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Taytech ile iletişime geçin. Gebze, Kocaeli merkezli ofisimiz ve fabrikamıza ulaşın. Teklif, teknik destek ve iş birliği için bize yazın.",
  alternates: { canonical: "/iletisim" },
  openGraph: {
    title: "İletişim | Taytech",
    description: "Taytech'e ulaşın: Adres, telefon, e-posta ve iletişim formu. Özel teklif ve teknik destek talepleriniz için.",
    url: "https://taytech.com.tr/iletisim",
  },
};

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
