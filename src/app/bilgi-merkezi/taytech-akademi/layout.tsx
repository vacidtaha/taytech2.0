import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taytech Akademi",
  description:
    "Taytech Akademi: Eğitimler, teknik içerikler ve uzmanlık paylaşımları yakında burada.",
  alternates: { canonical: "/bilgi-merkezi/taytech-akademi" },
};

export default function TaytechAkademiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
