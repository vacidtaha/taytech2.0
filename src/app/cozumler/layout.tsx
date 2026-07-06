import { Metadata } from "next";

export const metadata: Metadata = {
  // Düz string kök şablonunu ezer; alt sayfaların "| Taytech" eki alması için
  // şablon burada yeniden tanımlanır.
  title: { default: "Çözümler", template: "%s | Taytech" },
  description: "Taytech endüstriyel otomasyon çözümleri: Toplu konutlar, hastaneler, ticari tesisler, eğitim yapıları, spor tesisleri ve endüstriyel kazan daireleri için akıllı kontrol sistemleri.",
  alternates: { canonical: "/cozumler" },
  openGraph: {
    title: "Çözümler | Taytech",
    description: "Sektörlere özel ısıtma, soğutma ve otomasyon çözümleri.",
    url: "https://taytech.com.tr/cozumler",
  },
};

export default function CozumlerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
