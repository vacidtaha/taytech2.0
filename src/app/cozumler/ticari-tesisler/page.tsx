import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Ticari Tesisler İçin Isıtma ve Kontrol Çözümleri",
  description:
    "Alışveriş merkezleri, ofis binaları ve iş merkezleri için enerji verimliliğini en üst düzeye çıkaran akıllı ısıtma, soğutma ve kontrol çözümleri.",
  alternates: { canonical: "/cozumler/ticari-tesisler" },
  openGraph: {
    title: "Ticari Tesisler İçin Çözümler | Taytech",
    description:
      "AVM, ofis ve iş merkezleri için akıllı ısıtma, soğutma ve kontrol çözümleri.",
    url: "/cozumler/ticari-tesisler",
    images: [{ url: "/akıllıbina.webp" }],
  },
};

export default function TicariTesisler() {
  return (
    <SolutionDetail
      image="/akıllıbina.webp"
      nameKey="cozumler.ticari"
      descKey="cozumler.ticariDesc"
      h2Key="cozumler.ticari.h2"
      p1Key="cozumler.ticari.p1"
      p2Key="cozumler.ticari.p2"
    />
  );
}
