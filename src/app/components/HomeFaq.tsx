"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// Ana sayfada gösterilen en önemli 6 soru (SSS sayfasındaki çeviri anahtarları)
const FAQ_KEYS = ["g1", "u2", "u1", "t3", "t4", "t1"];

/** Ana sayfa — kırmızı arka planlı SSS bölümü (akordeon + tüm sorulara giden buton). */
export default function HomeFaq() {
  const { t } = useLanguage();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div
      className="relative overflow-hidden mx-[8px] lg:mx-[13px]"
      style={{
        marginTop: "13px",
        background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 55%, #ef4444 100%)",
      }}
    >
      <div
        style={{ padding: "48px 28px" }}
        className="lg:!px-[100px] lg:!py-[90px]"
      >
        {/* Başlık + buton */}
        <div className="mb-8 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mb-3 text-[26px] font-bold leading-tight text-white lg:text-[48px]">
              {t("sss.title")}
            </h2>
            <p className="max-w-[560px] text-[14px] leading-relaxed text-white/85 lg:text-[18px]">
              {t("sss.desc")}
            </p>
          </div>
          <Link
            href="/bilgi-merkezi/sikca-sorulan-sorular"
            className="inline-flex items-center gap-[10px] self-start whitespace-nowrap rounded-full bg-white px-[22px] py-[12px] text-[15px] font-semibold text-[#b91c1c] transition-all hover:bg-white/90 lg:self-auto lg:text-[17px]"
          >
            {t("home.sss.btn")}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Akordeon */}
        <div className="divide-y divide-white/15 border-y border-white/15">
          {FAQ_KEYS.map((key, i) => {
            const open = openIdx === i;
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left lg:py-6"
                >
                  <span className="text-[15px] font-semibold leading-snug text-white lg:text-[19px]">
                    {t(`sss.${key}.q`)}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-white/70 transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[860px] pb-6 text-[14px] leading-relaxed text-white/85 lg:text-[16px]">
                      {t(`sss.${key}.a`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
