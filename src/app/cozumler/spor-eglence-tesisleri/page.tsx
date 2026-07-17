import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/spor-eglence-tesisleri",
    title: {
      tr: "Spor ve Eğlence Tesisleri İçin Isıtma Çözümleri",
      en: "Heating Solutions for Sports and Leisure Facilities",
    },
    description: {
      tr: "Spor salonları, yüzme havuzları ve eğlence merkezlerinde konfor ve hijyen standartlarını karşılayan özel mekanik tesisat çözümleri.",
      en: "Bespoke mechanical solutions meeting comfort and hygiene standards in gyms, swimming pools and leisure centres.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/spor-tesisi.jpg" }] },
  };
}

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
