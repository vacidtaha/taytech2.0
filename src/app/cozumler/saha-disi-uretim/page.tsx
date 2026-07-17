import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/saha-disi-uretim",
    title: {
      tr: "Saha Dışı Üretim Projeleri İçin Çözümler",
      en: "Solutions for Offsite Manufacturing Projects",
    },
    description: {
      tr: "Prefabrik ve modüler yapı projelerinde fabrikada üretilip sahada monte edilen hazır ısı istasyonu ve kontrol panosu çözümleri.",
      en: "Factory-built, site-installed heat interface unit and control panel solutions for prefabricated and modular construction projects.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/akıllıtasıma.jpg" }] },
  };
}

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
