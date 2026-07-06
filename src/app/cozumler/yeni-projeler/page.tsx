import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Yeni Projeler İçin Mekanik Otomasyon Çözümleri",
  description:
    "Sıfırdan inşa edilen projelerde altyapı planlamasından devreye almaya kadar entegre mekanik otomasyon ve kontrol panosu çözümleri.",
  alternates: { canonical: "/cozumler/yeni-projeler" },
  openGraph: {
    title: "Yeni Projeler İçin Çözümler | Taytech",
    description:
      "Altyapı planlamasından devreye almaya entegre mekanik otomasyon çözümleri.",
    url: "/cozumler/yeni-projeler",
    images: [{ url: "/konferans.webp" }],
  },
};

export default function YeniProjeler() {
  return (
    <SolutionDetail
      image="/konferans.webp"
      nameKey="cozumler.yeni"
      descKey="cozumler.yeniDesc"
      h2Key="cozumler.yeni.h2"
      p1Key="cozumler.yeni.p1"
      p2Key="cozumler.yeni.p2"
    />
  );
}
