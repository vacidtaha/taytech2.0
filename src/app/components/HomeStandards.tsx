"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function HomeStandards() {
  const { t, lp } = useLanguage();

  return (
    <div
      className="bg-white grid grid-cols-1 lg:grid-cols-2 mx-[8px] lg:mx-[13px]"
      style={{ marginTop: "13px" }}
    >
      {/* Sol: Simge kutusu */}
      <div
        className="flex items-center justify-center lg:h-[650px]"
        style={{ paddingTop: "80px", paddingBottom: "40px" }}
      >
        <div
          className="w-44 h-44 lg:w-80 lg:h-80 rounded-2xl flex items-center justify-center relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at center, #ff6b6b 0%, #dc2626 50%, #991b1b 100%)",
          }}
        >
          <div className="grid grid-cols-2 gap-1">
            <Image
              src="/simge.png"
              alt="Taytech"
              width={95}
              height={95}
              className="w-10 h-10 lg:w-[95px] lg:h-[95px]"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <svg
              className="w-10 h-10 lg:w-20 lg:h-20 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <svg
              className="w-10 h-10 lg:w-20 lg:h-20 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <svg
              className="w-10 h-10 lg:w-20 lg:h-20 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
        </div>
      </div>
      {/* Sağ: İçerik */}
      <div className="relative lg:h-[650px]" style={{ padding: "48px 28px" }}>
        <div className="lg:absolute lg:top-1/2 lg:left-16 lg:right-16 lg:-translate-y-1/2 text-left">
          <h2
            className="text-3xl lg:text-6xl font-bold mb-4 lg:mb-6"
            style={{
              background: "linear-gradient(to bottom right, #dc2626, #991b1b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("home.standartlar.title")}
          </h2>
          <p className="text-sm lg:text-xl text-[#424245] mb-8 lg:mb-12">
            {t("home.standartlar.desc")}
          </p>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            <div>
              <span className="text-lg lg:text-2xl font-bold text-[#dc2626]">
                ISO 9001:2015
              </span>
              <p className="text-sm lg:text-base text-[#86868b] mt-1 lg:mt-2">
                {t("home.standartlar.iso1")}
              </p>
            </div>
            <div>
              <span className="text-lg lg:text-2xl font-bold text-[#dc2626]">
                ISO 14001:2015
              </span>
              <p className="text-sm lg:text-base text-[#86868b] mt-1 lg:mt-2">
                {t("home.standartlar.iso2")}
              </p>
            </div>
            <div>
              <span className="text-lg lg:text-2xl font-bold text-[#dc2626]">
                ISO 45001:2018
              </span>
              <p className="text-sm lg:text-base text-[#86868b] mt-1 lg:mt-2">
                {t("home.standartlar.iso3")}
              </p>
            </div>
          </div>
          <div className="mt-8 lg:mt-12">
            <Link
              href={lp("/kurumsal")}
              className="bg-[#dc2626] text-white text-sm font-medium transition-all duration-300 hover:bg-[#b91c1c] inline-block"
              style={{ padding: "10px 24px" }}
            >
              {t("home.standartlar.btn")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
