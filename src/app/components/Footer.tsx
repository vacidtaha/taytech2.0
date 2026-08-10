"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, Printer, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { FlagTR, FlagGB } from "./Flags";
import { openCookieSettings } from "@/lib/consent";

type Bi = { tr: string; en: string };

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);


const columns: { title: Bi; href: string; links: (Bi & { href: string })[] }[] = [
  {
    title: { tr: "Ürünler", en: "Products" },
    href: "/urunler",
    links: [
      { tr: "Motor Kontrol Panoları", en: "Motor Control Panels", href: "/urunler/kontrol-panelleri" },
      { tr: "Enerji Yönetim Platformu", en: "Building Management System", href: "/urunler/enerji-yonetim-platformu" },
      { tr: "Isı Ağları", en: "Heat Network", href: "/urunler/heat-network" },
    ],
  },
  {
    title: { tr: "Çözümler", en: "Solutions" },
    href: "/cozumler",
    links: [
      { tr: "Ticari Tesisler", en: "Commercial Facilities", href: "/cozumler/ticari-tesisler" },
      { tr: "Toplu Konutlar", en: "Residential Complexes", href: "/cozumler/toplu-konutlar" },
      { tr: "Hastaneler", en: "Hospitals", href: "/cozumler/hastaneler" },
      { tr: "Endüstriyel Kazan Dairesi", en: "Industrial Boiler Rooms", href: "/cozumler/endustriyel-kazan-dairesi" },
    ],
  },
  {
    title: { tr: "Bilgi Merkezi", en: "Knowledge Centre" },
    href: "/bilgi-merkezi/sikca-sorulan-sorular",
    links: [
      { tr: "Sıkça Sorulan Sorular", en: "FAQ", href: "/bilgi-merkezi/sikca-sorulan-sorular" },
      { tr: "Doküman Merkezi", en: "Document Centre", href: "/dokuman-merkezi" },
      { tr: "Teknik Destek", en: "Technical Support", href: "/iletisim" },
      { tr: "Taytech Akademi", en: "Taytech Academy", href: "/bilgi-merkezi/taytech-akademi" },
      { tr: "Video Arşivi", en: "Video Archive", href: "/bilgi-merkezi/video-arsivi" },
    ],
  },
  {
    title: { tr: "Kurumsal", en: "Corporate" },
    href: "/kurumsal",
    links: [
      { tr: "Hakkımızda", en: "About Us", href: "/kurumsal" },
      { tr: "İletişim", en: "Contact", href: "/iletisim" },
    ],
  },
];

const socials = [
  { label: "LinkedIn", href: "https://tr.linkedin.com/company/taytech-energy-technologies", Icon: LinkedinIcon },
  { label: "Instagram", href: "https://www.instagram.com/taytechenergy/", Icon: InstagramIcon },
];

export default function Footer() {
  const { locale, lp } = useLanguage();
  const pathname = usePathname();
  const L = (b: Bi) => (locale === "EN" ? b.en : b.tr);
  const year = new Date().getFullYear();

  if (pathname.startsWith("/giris") || pathname.startsWith("/yonetim")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-[#f5f5f7] text-[#1d1d1f]">
      <div className="mx-auto max-w-[100rem] px-6 py-12 md:px-12 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Marka + iletişim: iki ayrı şirket bloğu (Türkiye ve UK) */}
          <div className="space-y-12 md:col-span-4">
            {(() => {
              const trBlock = (
                <div key="tr">
                  <Link href={lp("/")} className="inline-flex items-center gap-3">
                    <Image src="/logos/taytech-logo.webp" alt="TayTech" width={1856} height={521} className="h-[26px] w-auto md:h-8" />
                    <FlagTR className="h-[18px] w-[26px] shrink-0 rounded-[3px] shadow-sm" />
                  </Link>
                  <span aria-hidden className="mt-3.5 block h-px w-44 bg-[#1d1d1f]" />
                  <div className="mt-5 space-y-3.5 text-base md:text-lg">
                    <a href="tel:+902625025149" className="flex items-center gap-3 text-[#424245] transition-colors hover:text-[#dc2626]">
                      <Phone size={19} className="shrink-0 text-[#dc2626]" />
                      <span>+90 (262) 502 51 49</span>
                    </a>
                    <div className="flex items-center gap-3 text-[#424245]">
                      <Printer size={19} className="shrink-0 text-[#dc2626]" />
                      <span>+90 (262) 502 51 52</span>
                    </div>
                    <a href="mailto:info@taytech.com.tr" className="flex items-center gap-3 text-[#424245] transition-colors hover:text-[#dc2626]">
                      <Mail size={19} className="shrink-0 text-[#dc2626]" />
                      <span>info@taytech.com.tr</span>
                    </a>
                    <a
                      href="https://www.google.com/maps/place/Taytech+Enerji+Teknolojileri"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-[#424245] transition-colors hover:text-[#dc2626]"
                    >
                      <MapPin size={19} className="mt-1 shrink-0 text-[#dc2626]" />
                      <span className="max-w-[18rem]">
                        <span className="mb-0.5 block text-sm font-semibold uppercase tracking-wider text-[#86868b]">Türkiye</span>
                        İnönü Mah. Gebze Plastikçiler OSB, Atatürk Bulvarı No:7/2, Gebze / Kocaeli
                      </span>
                    </a>
                  </div>
                  <a
                    href="https://www.linkedin.com/company/taytech-energy-technologies"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Taytech Türkiye LinkedIn"
                    className="mt-5 inline-flex text-[#0A66C2] transition-opacity hover:opacity-80"
                  >
                    <LinkedinIcon size={26} />
                  </a>
                </div>
              );
              const ukBlock = (
                <div key="uk" lang="en">
                  <Link href={lp("/")} className="inline-flex items-center gap-3">
                    <Image src="/logos/taytech-uk-logo.webp" alt="TayTech UK" width={1886} height={391} className="h-[22px] w-auto md:h-[26px]" />
                    <FlagGB className="h-[18px] w-[26px] shrink-0 rounded-[3px] shadow-sm" />
                  </Link>
                  <span aria-hidden className="mt-3.5 block h-px w-44 bg-[#1d1d1f]" />
                  <div className="mt-5 space-y-3.5 text-base md:text-lg">
                    <a href="mailto:sales@taytech.com" className="flex items-center gap-3 text-[#424245] transition-colors hover:text-[#dc2626]">
                      <Mail size={19} className="shrink-0 text-[#dc2626]" />
                      <span>sales@taytech.com</span>
                    </a>
                    <a
                      href="https://www.google.com/maps/search/17+Green+Lanes,+London+N16+9BS"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 text-[#424245] transition-colors hover:text-[#dc2626]"
                    >
                      <MapPin size={19} className="mt-1 shrink-0 text-[#dc2626]" />
                      <span className="max-w-[18rem]">
                        <span className="mb-0.5 block text-sm font-semibold uppercase tracking-wider text-[#86868b]">United Kingdom</span>
                        17 Green Lanes, London N16 9BS, United Kingdom
                      </span>
                    </a>
                  </div>
                  <a
                    href="https://uk.linkedin.com/company/taytech-uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Taytech UK LinkedIn"
                    className="mt-5 inline-flex text-[#0A66C2] transition-opacity hover:opacity-80"
                  >
                    <LinkedinIcon size={26} />
                  </a>
                </div>
              );
              // İngilizce sayfada UK bloğu üstte gösterilir.
              return locale === "EN" ? [ukBlock, trBlock] : [trBlock, ukBlock];
            })()}
          </div>

          {/* Bağlantı sütunları */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:col-span-8 md:mt-[88px] md:grid-cols-4 md:gap-8">
            {columns.map((col) => (
              <div key={col.title.tr}>
                <Link
                  href={lp(col.href)}
                  className="text-base font-semibold text-[#1d1d1f] transition-colors hover:text-[#dc2626] md:text-xl"
                >
                  {L(col.title)}
                </Link>
                <ul className="mt-4 space-y-3 md:mt-5 md:space-y-3.5">
                  {col.links.map((link) => (
                    <li key={link.tr}>
                      <Link
                        href={lp(link.href)}
                        className="text-sm leading-snug text-[#6e6e73] transition-colors hover:text-[#dc2626] md:text-lg"
                      >
                        {L(link)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt bar */}
      <div className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-[100rem] flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row md:px-12">
          <p className="text-center text-xs text-[#86868b] md:text-left md:text-sm">
            © {year} Taytech Enerji Teknolojileri San. ve Tic. A.Ş.{" "}
            {locale === "EN" ? "All rights reserved." : "Tüm hakları saklıdır."}
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={openCookieSettings}
              className="text-xs text-[#86868b] transition-colors hover:text-[#dc2626] md:text-sm"
            >
              {locale === "EN" ? "Cookie Settings" : "Çerez Ayarları"}
            </button>
            <div className="flex items-center gap-4">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#86868b] transition-colors hover:text-[#dc2626]"
                >
                  <Icon size={22} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
