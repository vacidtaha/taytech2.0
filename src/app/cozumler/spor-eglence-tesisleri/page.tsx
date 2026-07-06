import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Spor ve Eğlence Tesisleri İçin Isıtma Çözümleri",
  description:
    "Spor salonları, yüzme havuzları ve eğlence merkezlerinde konfor ve hijyen standartlarını karşılayan özel mekanik tesisat çözümleri.",
  alternates: { canonical: "/cozumler/spor-eglence-tesisleri" },
  openGraph: {
    title: "Spor ve Eğlence Tesisleri İçin Çözümler | Taytech",
    description:
      "Spor salonu, havuz ve eğlence merkezleri için özel mekanik tesisat çözümleri.",
    url: "/cozumler/spor-eglence-tesisleri",
    images: [{ url: "/spor-tesisi.jpg" }],
  },
};

export default function SporEglenceTesisleri() {
  return (
    <SolutionDetail
      image="/spor-tesisi.jpg"
      nameKey="cozumler.spor"
      descKey="cozumler.sporDesc"
      h2Key="cozumler.spor.h2"
      p1Key="cozumler.spor.p1"
      p2Key="cozumler.spor.p2"
    />
  );
}
