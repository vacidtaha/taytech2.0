import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Bakım ve Huzur Evleri İçin Isıtma ve Kontrol Çözümleri",
  description:
    "Kesintisiz konfor ve güvenlik gerektiren bakım tesisleri için hassas sıcaklık kontrolü ve enerji izleme sistemleri.",
  alternates: { canonical: "/cozumler/bakim-huzur-evleri" },
  openGraph: {
    title: "Bakım ve Huzur Evleri İçin Çözümler | Taytech",
    description:
      "Bakım tesisleri için hassas sıcaklık kontrolü ve enerji izleme sistemleri.",
    url: "/cozumler/bakim-huzur-evleri",
    images: [{ url: "/bakimevi.jpg" }],
  },
};

export default function BakimHuzurEvleri() {
  return (
    <SolutionDetail
      image="/bakimevi.jpg"
      nameKey="cozumler.bakim"
      descKey="cozumler.bakimDesc"
      h2Key="cozumler.bakim.h2"
      p1Key="cozumler.bakim.p1"
      p2Key="cozumler.bakim.p2"
    />
  );
}
