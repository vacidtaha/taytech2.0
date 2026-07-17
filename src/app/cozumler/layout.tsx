import { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await localizedMetadata({
    path: "/cozumler",
    title: { tr: "Çözümler", en: "Solutions" },
    description: {
      tr: "Taytech endüstriyel otomasyon çözümleri: Toplu konutlar, hastaneler, ticari tesisler, eğitim yapıları, spor tesisleri ve endüstriyel kazan daireleri için akıllı kontrol sistemleri.",
      en: "Taytech industrial automation solutions: smart control systems for residential complexes, hospitals, commercial facilities, educational buildings, sports facilities and industrial boiler rooms.",
    },
  });
  // Alt sayfaların "| Taytech" eki alması için şablon yeniden tanımlanır.
  return {
    ...meta,
    title: { default: meta.title as string, template: "%s | Taytech" },
  };
}

export default function CozumlerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
