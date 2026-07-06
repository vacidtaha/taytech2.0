import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Taytech ürünleri, ısı istasyonları, kontrol panoları ve servis hizmetleri hakkında sıkça sorulan sorular ve yanıtları.",
  alternates: { canonical: "/bilgi-merkezi/sikca-sorulan-sorular" },
  openGraph: {
    title: "SSS | Taytech",
    description: "Taytech ürünleri hakkında merak edilenler.",
    url: "https://taytech.com.tr/bilgi-merkezi/sikca-sorulan-sorular",
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Taytech ne iş yapar?", acceptedAnswer: { "@type": "Answer", text: "Taytech Enerji Teknolojileri San. ve Tic. A.Ş., ısıtma-soğutma kontrol sistemleri, akıllı kontrol panoları, ısı istasyonları, elektronik kontrolörler, IRONTRAP® manyetik filtreler ve Taytech Cloud uzaktan izleme platformu alanlarında uçtan uca mühendislik çözümleri sunan bir Türk teknoloji şirketidir." } },
    { "@type": "Question", name: "Taytech hangi sertifikalara sahiptir?", acceptedAnswer: { "@type": "Answer", text: "Taytech, ISO 9001:2015 Kalite Yönetimi, ISO 14001:2015 Çevre Yönetimi ve ISO 45001:2018 İş Sağlığı ve Güvenliği sertifikalarına sahiptir." } },
    { "@type": "Question", name: "Akıllı Kontrol Panoları nelerdir?", acceptedAnswer: { "@type": "Answer", text: "Akıllı Kontrol Panoları, pompa ve motor sistemlerinin otomatik olarak yönetilmesini sağlayan elektronik veya elektromekanik kontrol üniteleridir. Direct Start, İnvertör, Soft Starter ve Yıldız-Üçgen yol verme gibi farklı tiplerde üretilmektedir." } },
    { "@type": "Question", name: "IRONTRAP® Manyetik Filtre ne işe yarar?", acceptedAnswer: { "@type": "Answer", text: "IRONTRAP® Manyetik Filtre, ısıtma ve soğutma sistemlerindeki su devresinde dolaşan manyetik parçacıkları yakalayarak sistemin verimini korur. Geleneksel yöntemlere göre %65 daha iyi performans gösterir." } },
    { "@type": "Question", name: "Taytech Cloud nedir?", acceptedAnswer: { "@type": "Answer", text: "Taytech Cloud, tüm mekanik tesisat sistemlerinizi uzaktan izlemenizi ve yönetmenizi sağlayan IoT tabanlı bir platformdur." } },
    { "@type": "Question", name: "Satış sonrası teknik destek sunuyor musunuz?", acceptedAnswer: { "@type": "Answer", text: "Evet. Taytech olarak satış öncesi danışmanlıktan kurulum sonrası teknik desteğe kadar tüm süreçlerde yanınızdayız." } },
    { "@type": "Question", name: "Hangi sektörlere çözüm sunuyorsunuz?", acceptedAnswer: { "@type": "Answer", text: "Ticari tesisler, toplu konutlar, bakım ve huzur evleri, hastaneler, endüstriyel kazan daireleri, spor ve eğlence tesisleri, saha dışı üretim projeleri ve eğitim yapıları başta olmak üzere geniş bir sektör yelpazesine hizmet vermekteyiz." } },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {children}
    </>
  );
}
