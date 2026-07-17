import { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    path: "/dokuman-merkezi",
    title: { tr: "Doküman Merkezi", en: "Document Centre" },
    description: {
      tr: "Taytech ürünlerine ait kataloglar, kullanım kılavuzları, sertifikalar ve CAD çizimleri.",
      en: "Catalogues, user manuals, certificates and CAD drawings for Taytech products.",
    },
  });
}

export default function DokumanMerkeziLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
