import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/bakim-huzur-evleri",
    title: {
      tr: "Bakım ve Huzur Evleri İçin Isıtma ve Kontrol Çözümleri",
      en: "Heating & Control Solutions for Care and Nursing Homes",
    },
    description: {
      tr: "Kesintisiz konfor ve güvenlik gerektiren bakım tesisleri için hassas sıcaklık kontrolü ve enerji izleme sistemleri.",
      en: "Precise temperature control and energy monitoring systems for care facilities that require uninterrupted comfort and safety.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/bakimevi.jpg" }] },
  };
}

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
