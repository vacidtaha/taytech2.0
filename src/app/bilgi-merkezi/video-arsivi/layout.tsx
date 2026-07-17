import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    path: "/bilgi-merkezi/video-arsivi",
    title: { tr: "Video Arşivi", en: "Video Archive" },
    description: {
      tr: "Taytech video arşivi: Ürünlerimizi, teknolojimizi ve hikayemizi anlatan videolar yakında burada.",
      en: "Taytech video archive: videos about our products, technology and story are coming soon.",
    },
  });
}

export default function VideoArsiviLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
