import { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    path: "/kurumsal",
    title: { tr: "Kurumsal", en: "Corporate" },
    description: {
      tr: "Taytech Enerji Teknolojileri San. ve Tic. A.Ş. - 5.600 m² üretim alanı, ISO 9001, ISO 14001, ISO 45001 sertifikalı, Gebze merkezli endüstriyel otomasyon üreticisi. Mühendislik, kalite standartları ve sürdürülebilirlik.",
      en: "Taytech Energy Technologies - 5,600 m² production facility, ISO 9001, ISO 14001 and ISO 45001 certified industrial automation manufacturer. Engineering, quality standards and sustainability.",
    },
  });
}

export default function KurumsalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
