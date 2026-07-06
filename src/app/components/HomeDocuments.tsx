"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import type { DocumentItem } from "@/lib/catalog";
import { DocIcon, docTypeLabels } from "./DocIcon";

export default function HomeDocuments({
  docs = [],
}: {
  docs?: DocumentItem[];
}) {
  const { t, locale } = useLanguage();
  const isEn = locale === "EN";

  const tl = (type: string) => docTypeLabels[type]?.[isEn ? "en" : "tr"] ?? type;
  const docUrl = (doc: DocumentItem) => (isEn && doc.urlEn ? doc.urlEn : doc.url);

  return (
    <div
      className="relative overflow-hidden bg-white mx-[8px] lg:mx-[13px]"
      style={{ marginTop: "13px" }}
    >
      {/* Gradyan dekor (iletişim sayfasındaki png) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/gradyan1.png"
          alt=""
          width={1920}
          height={600}
          priority
          style={{
            width: "100%",
            height: "auto",
            filter: "hue-rotate(140deg) saturate(1.2)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* İçerik (gradyanın üstünde) */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{ padding: "32px 28px" }}
          className="lg:!px-[100px] lg:!pt-[80px] lg:!pb-[50px]"
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
            <div>
              <h2
                className="text-[26px] lg:text-[48px] font-bold leading-tight mb-3"
                style={{
                  display: "inline-block",
                  paddingBottom: "0.1em",
                  backgroundImage:
                    "linear-gradient(90deg, #dc2626 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                {t("home.dokuman.title")}
              </h2>
              <p
                className="text-[14px] lg:text-[18px] leading-relaxed"
                style={{ color: "#4b4b4f", fontWeight: 450 }}
              >
                {t("home.dokuman.desc")}
              </p>
            </div>
            <Link
              href="/dokuman-merkezi"
              className="self-start lg:self-auto hover:!opacity-85"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "17px",
                fontWeight: 600,
                color: "#ffffff",
                textDecoration: "none",
                border: "none",
                padding: "12px 24px",
                borderRadius: "980px",
                backgroundImage:
                  "linear-gradient(90deg, #dc2626 0%, #ec4899 100%)",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {t("home.dokuman.btn")}
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
        </div>
        <div
          style={{ padding: "0 28px 32px" }}
          className="lg:!px-[100px] lg:!pb-[80px]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {docs.length > 0
              ? docs.slice(0, 8).map((doc) => (
                  <a
                    key={doc.id}
                    href={docUrl(doc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block no-underline"
                  >
                    <div
                      className="flex h-full min-h-[150px] flex-col transition-all duration-200 group-hover:!border-[#dc2626] group-hover:!bg-[#dc2626] md:min-h-[230px]"
                      style={{
                        background: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <div className="hidden h-[110px] items-center justify-center border-b border-black/[0.08] transition-all duration-200 group-hover:!border-white/20 md:flex">
                        <div className="transition-all duration-200 group-hover:!brightness-0 group-hover:!invert">
                          <DocIcon type={doc.type} />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-4 lg:px-5 lg:pb-5">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#dc2626] transition-colors duration-200 group-hover:!text-white/70">
                          {tl(doc.type)}
                        </p>
                        <h3 className="mb-1 text-[13px] font-semibold leading-tight text-[#1d1d1f] transition-colors duration-200 group-hover:!text-white lg:text-[15px]">
                          {isEn ? doc.nameEn : doc.nameTr}
                        </h3>
                        <p className="mb-auto text-[11px] text-[#86868b] transition-colors duration-200 group-hover:!text-white/60 lg:text-[12px]">
                          {isEn ? doc.productNameEn : doc.productNameTr}
                        </p>
                        <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.05em] text-[#dc2626] transition-colors duration-200 group-hover:!text-white lg:text-[11px]">
                          {isEn ? "Download" : "İndir"}
                        </span>
                      </div>
                    </div>
                  </a>
                ))
              : [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div
                    key={i}
                    className="h-[150px] md:h-[230px]"
                    style={{
                      background: "rgba(0,0,0,0.02)",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
