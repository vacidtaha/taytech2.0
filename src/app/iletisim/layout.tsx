import { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    path: "/iletisim",
    title: { tr: "İletişim", en: "Contact" },
    description: {
      tr: "Taytech ile iletişime geçin. Gebze, Kocaeli merkezli ofisimiz ve fabrikamıza ulaşın. Teklif, teknik destek ve iş birliği için bize yazın.",
      en: "Get in touch with Taytech. Reach our offices in Gebze, Kocaeli and London. Write to us for quotations, technical support and partnerships.",
    },
  });
}

export default function IletisimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
