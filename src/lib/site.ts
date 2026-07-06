/** Sitenin canlı adresi. Ortam değişkeniyle ezilebilir (ör. staging). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://taytech.com.tr";

export const SITE_NAME = "Taytech";

/**
 * Metin açıklamalarını meta description için kısaltır:
 * boşlukları sadeleştirir, kelime sınırında keser.
 */
export function metaDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}
