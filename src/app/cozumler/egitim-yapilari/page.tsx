import type { Metadata } from "next";
import SolutionDetail from "../SolutionDetail";

export const metadata: Metadata = {
  title: "Eğitim Yapıları İçin Isıtma ve Kontrol Çözümleri",
  description:
    "Okullar, üniversiteler ve kampüs alanlarında enerji verimliliğini artıran, uzaktan yönetilebilir merkezi ısıtma ve kontrol sistemleri.",
  alternates: { canonical: "/cozumler/egitim-yapilari" },
  openGraph: {
    title: "Eğitim Yapıları İçin Çözümler | Taytech",
    description:
      "Okul ve kampüslerde uzaktan yönetilebilir merkezi ısıtma ve kontrol sistemleri.",
    url: "/cozumler/egitim-yapilari",
    images: [{ url: "/okul.jpg" }],
  },
};

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
