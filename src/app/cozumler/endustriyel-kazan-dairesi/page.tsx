import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Endüstriyel Kazan Daireleri İçin Kontrol Çözümleri",
  description:
    "Yüksek kapasiteli endüstriyel kazan dairelerinde verimlilik artışı, enerji tasarrufu ve uzaktan izleme çözümleri.",
  alternates: { canonical: "/cozumler/endustriyel-kazan-dairesi" },
  openGraph: {
    title: "Endüstriyel Kazan Daireleri İçin Çözümler | Taytech",
    description:
      "Endüstriyel kazan dairelerinde verimlilik, enerji tasarrufu ve uzaktan izleme.",
    url: "/cozumler/endustriyel-kazan-dairesi",
    images: [{ url: "/kazan-dairesi.webp" }],
  },
};

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
