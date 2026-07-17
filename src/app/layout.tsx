import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SiteContactDock from "./components/SiteContactDock";
import CookieConsent from "./components/CookieConsent";
import { LanguageProvider } from "./context/LanguageContext";
import { getMenu } from "@/lib/catalog";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { requestIsEn } from "@/lib/i18n-meta";

const TITLE_TR = "Taytech | Motor Kontrol Panoları & Isı İstasyonları";
const TITLE_EN = "Taytech | Motor Control Panels & Heat Interface Units";
const DESC_TR =
  "Akıllı motor kontrol panoları, ısı istasyonları, IRONTRAP manyetik filtreler ve Taytech Cloud uzaktan izleme. Gebze merkezli, ISO sertifikalı üretici Taytech.";
const DESC_EN =
  "Smart motor control panels, heat interface units, IRONTRAP magnetic filters and Taytech Cloud remote monitoring. ISO-certified manufacturer Taytech.";

export async function generateMetadata(): Promise<Metadata> {
  const isEn = await requestIsEn();
  const title = isEn ? TITLE_EN : TITLE_TR;
  const description = isEn ? DESC_EN : DESC_TR;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    alternates: {
      canonical: isEn ? "/en" : "/",
      languages: { tr: "/", en: "/en", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: isEn ? "en_GB" : "tr_TR",
      url: isEn ? `${SITE_URL}/en` : SITE_URL,
      title,
      description: isEn
        ? "Smart motor control panels, heat interface units, magnetic filters and remote monitoring solutions."
        : "Akıllı motor kontrol panoları, ısı istasyonları, manyetik filtreler ve uzaktan izleme çözümleri.",
      images: [{ url: "/og.png", width: 1200, height: 675, alt: "Taytech" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: ["/og.png"],
    },
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Taytech Enerji Teknolojileri San. ve Tic. A.Ş.",
  alternateName: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  email: "info@taytech.com.tr",
  telephone: "+90 262 502 51 49",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Gebze",
    addressRegion: "Kocaeli",
    addressCountry: "TR",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menu, isEn] = await Promise.all([getMenu(), requestIsEn()]);

  return (
    <html lang={isEn ? "en" : "tr"} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/*
          Google Consent Mode v2 varsayılanları — tüm izinler kullanıcı onayı
          gelene kadar "denied". Google Analytics (gtag.js) ileride eklendiğinde
          bu script'in ALTINA yüklenmeli; CookieConsent bileşeni onay geldiğinde
          "consent update" gönderir.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`,
          }}
        />
        <LanguageProvider>
          <Header menu={menu} />
          {children}
          <Footer />
          <SiteContactDock />
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
