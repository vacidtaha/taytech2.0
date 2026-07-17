import type { Metadata } from "next";
import { headers } from "next/headers";
import { trToEn } from "./paths";

export const LOCALE_HEADER = "x-taytech-locale";

/** Proxy'nin eklediği dil başlığından isteğin dilini okur. */
export async function requestIsEn(): Promise<boolean> {
  const h = await headers();
  return h.get(LOCALE_HEADER) === "EN";
}

/**
 * İki dilli sayfa metadata'sı üretir: dil isteğin URL'sinden gelir,
 * canonical kendi dilindeki URL'yi gösterir, hreflang her iki sürümü listeler.
 */
export async function localizedMetadata(opts: {
  /** Sayfanın Türkçe (kanonik) yolu, ör. "/cozumler/hastaneler". */
  path: string;
  title: { tr: string; en: string };
  description?: { tr: string; en: string };
}): Promise<Metadata> {
  const isEn = await requestIsEn();
  const trPath = opts.path;
  const enPath = trToEn(trPath);

  return {
    title: isEn ? opts.title.en : opts.title.tr,
    description: opts.description
      ? isEn
        ? opts.description.en
        : opts.description.tr
      : undefined,
    alternates: {
      canonical: isEn ? enPath : trPath,
      languages: {
        tr: trPath,
        en: enPath,
        "x-default": trPath,
      },
    },
    openGraph: {
      title: isEn ? opts.title.en : opts.title.tr,
      description: opts.description
        ? isEn
          ? opts.description.en
          : opts.description.tr
        : undefined,
      url: isEn ? enPath : trPath,
      locale: isEn ? "en_GB" : "tr_TR",
    },
  };
}
