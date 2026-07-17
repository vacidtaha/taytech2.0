import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/ticari-tesisler",
    title: {
      tr: "Ticari Tesisler İçin Isıtma ve Kontrol Çözümleri",
      en: "Heating & Control Solutions for Commercial Facilities",
    },
    description: {
      tr: "Alışveriş merkezleri, ofis binaları ve iş merkezleri için enerji verimliliğini en üst düzeye çıkaran akıllı ısıtma, soğutma ve kontrol çözümleri.",
      en: "Smart heating, cooling and control solutions maximising energy efficiency for shopping centres, office buildings and business complexes.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/akıllıbina.webp" }] },
  };
}

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
