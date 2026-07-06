import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Arşivi",
  description:
    "Taytech video arşivi: Ürünlerimizi, teknolojimizi ve hikayemizi anlatan videolar yakında burada.",
  alternates: { canonical: "/bilgi-merkezi/video-arsivi" },
};

export default function VideoArsiviLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
