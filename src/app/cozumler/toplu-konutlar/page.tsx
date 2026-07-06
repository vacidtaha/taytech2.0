import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Toplu Konutlar İçin Isıtma ve Kontrol Çözümleri",
  description:
    "Site, rezidans ve toplu yaşam alanlarında merkezi ısıtma ve sıcak su sistemlerinin optimize edilmesi için uçtan uca otomasyon çözümleri.",
  alternates: { canonical: "/cozumler/toplu-konutlar" },
  openGraph: {
    title: "Toplu Konutlar İçin Çözümler | Taytech",
    description:
      "Site ve rezidanslarda merkezi ısıtma ve sıcak su sistemleri için uçtan uca otomasyon.",
    url: "/cozumler/toplu-konutlar",
    images: [{ url: "/akıllısehir.webp" }],
  },
};

export default function TopluKonutlar() {
  return (
    <SolutionDetail
      image="/akıllısehir.webp"
      nameKey="cozumler.toplu"
      descKey="cozumler.topluDesc"
      h2Key="cozumler.toplu.h2"
      p1Key="cozumler.toplu.p1"
      p2Key="cozumler.toplu.p2"
    />
  );
}
