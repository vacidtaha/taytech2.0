import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/endustriyel-kazan-dairesi",
    title: {
      tr: "Endüstriyel Kazan Daireleri İçin Kontrol Çözümleri",
      en: "Control Solutions for Industrial Boiler Rooms",
    },
    description: {
      tr: "Yüksek kapasiteli endüstriyel kazan dairelerinde verimlilik artışı, enerji tasarrufu ve uzaktan izleme çözümleri.",
      en: "Efficiency gains, energy savings and remote monitoring solutions for high-capacity industrial boiler rooms.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/kazan-dairesi.webp" }] },
  };
}

export default function EndustriyelKazanDairesi() {
  return (
    <SolutionDetail
      image="/kazan-dairesi.webp"
      nameKey="cozumler.kazan"
      descKey="cozumler.kazanDesc"
      h2Key="cozumler.kazan.h2"
      p1Key="cozumler.kazan.p1"
      p2Key="cozumler.kazan.p2"
    />
  );
}
