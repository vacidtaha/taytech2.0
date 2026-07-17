import { Metadata } from "next";
import { localizedMetadata, requestIsEn } from "@/lib/i18n-meta";
import { faqTranslations } from "@/app/locales/faq";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    path: "/bilgi-merkezi/sikca-sorulan-sorular",
    title: { tr: "Sıkça Sorulan Sorular", en: "Frequently Asked Questions" },
    description: {
      tr: "Taytech ürünleri, ısı istasyonları, kontrol panoları ve servis hizmetleri hakkında sıkça sorulan sorular ve yanıtları.",
      en: "Frequently asked questions and answers about Taytech products, heat interface units, control panels and services.",
    },
  });
}

/**
 * FAQPage JSON-LD, çeviri dosyasından otomatik üretilir; SSS'ye eklenen
 * her yeni soru yapılandırılmış veriye de kendiliğinden girer.
 */
function buildFaqLd(isEn: boolean) {
  const dict = faqTranslations[isEn ? "EN" : "TR"];
  const mainEntity = Object.keys(dict)
    .filter((key) => key.endsWith(".q"))
    .map((qKey) => {
      const base = qKey.slice(0, -2);
      const answer = dict[`${base}.a`];
      if (!answer) return null;
      return {
        "@type": "Question",
        name: dict[qKey],
        acceptedAnswer: { "@type": "Answer", text: answer },
      };
    })
    .filter(Boolean);
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const isEn = await requestIsEn();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqLd(isEn)) }}
      />
      {children}
    </>
  );
}
