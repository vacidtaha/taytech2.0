import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Saha Dışı Üretim Projeleri İçin Çözümler",
  description:
    "Prefabrik ve modüler yapı projelerinde fabrikada üretilip sahada monte edilen hazır ısı istasyonu ve kontrol panosu çözümleri.",
  alternates: { canonical: "/cozumler/saha-disi-uretim" },
  openGraph: {
    title: "Saha Dışı Üretim İçin Çözümler | Taytech",
    description:
      "Prefabrik ve modüler projeler için fabrikada üretilen hazır ısı istasyonu ve pano çözümleri.",
    url: "/cozumler/saha-disi-uretim",
    images: [{ url: "/akıllıtasıma.jpg" }],
  },
};

export default function SahaDisiUretim() {
  return (
    <SolutionDetail
      image="/akıllıtasıma.jpg"
      nameKey="cozumler.saha"
      descKey="cozumler.sahaDesc"
      h2Key="cozumler.saha.h2"
      p1Key="cozumler.saha.p1"
      p2Key="cozumler.saha.p2"
    />
  );
}
