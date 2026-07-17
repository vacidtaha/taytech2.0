import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/hastaneler",
    title: {
      tr: "Hastaneler İçin Isıtma ve Kontrol Çözümleri",
      en: "Heating & Control Solutions for Hospitals",
    },
    description: {
      tr: "Kritik çevre koşullarının sürekli izlenmesi gereken sağlık tesislerinde yüksek güvenilirlikli ısı istasyonu ve kontrol sistemleri.",
      en: "Highly reliable heat interface units and control systems for healthcare facilities where critical conditions must be monitored continuously.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/hastane.webp" }] },
  };
}

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
