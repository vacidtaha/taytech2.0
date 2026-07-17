import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/toplu-konutlar",
    title: {
      tr: "Toplu Konutlar İçin Isıtma ve Kontrol Çözümleri",
      en: "Heating & Control Solutions for Residential Complexes",
    },
    description: {
      tr: "Site, rezidans ve toplu yaşam alanlarında merkezi ısıtma ve sıcak su sistemlerinin optimize edilmesi için uçtan uca otomasyon çözümleri.",
      en: "End-to-end automation solutions for optimising central heating and hot water systems in residential estates and apartment complexes.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/akıllısehir.webp" }] },
  };
}

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
