import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurumsal",
  description: "Taytech Enerji Teknolojileri San. ve Tic. A.Ş. - 5.600 m² üretim alanı, ISO 9001, ISO 14001, ISO 45001 sertifikalı, Gebze merkezli endüstriyel otomasyon üreticisi. Mühendislik, kalite standartları ve sürdürülebilirlik.",
  alternates: { canonical: "/kurumsal" },
  openGraph: {
    title: "Kurumsal | Taytech",
    description: "Taytech hakkında: Mühendislik vizyonumuz, üretim tesislerimiz, kalite standartlarımız ve sürdürülebilirlik yaklaşımımız.",
    url: "https://taytech.com.tr/kurumsal",
  },
};

export default function KurumsalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
