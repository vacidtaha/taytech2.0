import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/i18n-meta";

export async function generateMetadata(): Promise<Metadata> {
  return localizedMetadata({
    path: "/bilgi-merkezi/taytech-akademi",
    title: { tr: "Taytech Akademi", en: "Taytech Academy" },
    description: {
      tr: "Taytech Akademi: Eğitimler, teknik içerikler ve uzmanlık paylaşımları yakında burada.",
      en: "Taytech Academy: training courses, technical content and expert insights are coming soon.",
    },
  });
}

export default function TaytechAkademiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
