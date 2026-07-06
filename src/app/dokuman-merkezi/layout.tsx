import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doküman Merkezi",
  description:
    "Taytech ürünlerine ait kataloglar, kullanım kılavuzları, sertifikalar ve CAD çizimleri.",
  alternates: { canonical: "/dokuman-merkezi" },
};

export default function DokumanMerkeziLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
