import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler/egitim-yapilari",
    title: {
      tr: "Eğitim Yapıları İçin Isıtma ve Kontrol Çözümleri",
      en: "Heating & Control Solutions for Educational Buildings",
    },
    description: {
      tr: "Okullar, üniversiteler ve kampüs alanlarında enerji verimliliğini artıran, uzaktan yönetilebilir merkezi ısıtma ve kontrol sistemleri.",
      en: "Remotely managed central heating and control systems that improve energy efficiency in schools, universities and campuses.",
    },
  });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, images: [{ url: "/okul.jpg" }] },
  };
}

export default function EgitimYapilari() {
  return (
    <SolutionDetail
      image="/okul.jpg"
      nameKey="cozumler.egitim"
      descKey="cozumler.egitimDesc"
      h2Key="cozumler.egitim.h2"
      p1Key="cozumler.egitim.p1"
      p2Key="cozumler.egitim.p2"
    />
  );
}
