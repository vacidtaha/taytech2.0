import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SiteContactDock from "./components/SiteContactDock";
import { LanguageProvider } from "./context/LanguageContext";
import { getMenu } from "@/lib/catalog";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Taytech | Motor Kontrol Panoları & Isı İstasyonları",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Akıllı motor kontrol panoları, ısı istasyonları, IRONTRAP manyetik filtreler ve Taytech Cloud uzaktan izleme. Gebze merkezli, ISO sertifikalı üretici Taytech.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "tr_TR",
    url: SITE_URL,
    title: "Taytech | Motor Kontrol Panoları & Isı İstasyonları",
    description:
      "Akıllı motor kontrol panoları, ısı istasyonları, manyetik filtreler ve uzaktan izleme çözümleri.",
    images: [{ url: "/og.png", width: 1200, height: 675, alt: "Taytech" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taytech | Motor Kontrol Panoları & Isı İstasyonları",
    images: ["/og.png"],
  },
};

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
  const menu = await getMenu();
  const cookieStore = await cookies();
  const initialLocale = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value) ?? "TR";

  return (
    <html lang={initialLocale === "EN" ? "en" : "tr"} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <LanguageProvider initialLocale={initialLocale}>
          <Header menu={menu} />
          {children}
          <Footer />
          <SiteContactDock />
        </LanguageProvider>
      </body>
    </html>
  );
}
