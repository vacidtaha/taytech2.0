import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/yeni-projeler",
    title: {
      tr: "Yeni Projeler İçin Mekanik Otomasyon Çözümleri",
      en: "Mechanical Automation Solutions for New Projects",
    },
    description: {
      tr: "Sıfırdan inşa edilen projelerde altyapı planlamasından devreye almaya kadar entegre mekanik otomasyon ve kontrol panosu çözümleri.",
      en: "Integrated mechanical automation and control panel solutions from infrastructure planning to commissioning for new-build projects.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/konferans.webp" }] },
  };
}

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
