import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Hastaneler İçin Isıtma ve Kontrol Çözümleri",
  description:
    "Kritik çevre koşullarının sürekli izlenmesi gereken sağlık tesislerinde yüksek güvenilirlikli ısı istasyonu ve kontrol sistemleri.",
  alternates: { canonical: "/cozumler/hastaneler" },
  openGraph: {
    title: "Hastaneler İçin Çözümler | Taytech",
    description:
      "Sağlık tesislerinde yüksek güvenilirlikli ısı istasyonu ve kontrol sistemleri.",
    url: "/cozumler/hastaneler",
    images: [{ url: "/hastane.webp" }],
  },
};

export default function Hastaneler() {
  return (
    <SolutionDetail
      image="/hastane.webp"
      nameKey="cozumler.hastane"
      descKey="cozumler.hastaneDesc"
      h2Key="cozumler.hastane.h2"
      p1Key="cozumler.hastane.p1"
      p2Key="cozumler.hastane.p2"
    />
  );
}
