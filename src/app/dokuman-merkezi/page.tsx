import { getAllDocuments } from "@/lib/catalog";
import DocumentCenter from "./DocumentCenter";

export default async function DokumanMerkeziPage() {
  const docs = await getAllDocuments();
  return <DocumentCenter docs={docs} />;
}
