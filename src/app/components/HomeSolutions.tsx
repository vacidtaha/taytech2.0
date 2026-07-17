"use client";

import Link from "next/link";
import {
  Building2,
  Home as HomeIcon,
  Heart,
  Hammer,
  Hospital,
  Flame,
  Dumbbell,
  Factory,
  GraduationCap,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const MOSAIC_ICONS = [
  Building2,
  HomeIcon,
  Heart,
  Hammer,
  Hospital,
  Flame,
  Dumbbell,
  Factory,
  GraduationCap,
];

export default function HomeSolutions() {
  const { t, lp } = useLanguage();

  return (
    <div
      className="bg-white flex flex-col items-center relative overflow-hidden mx-[8px] lg:mx-[13px]"
      style={{ marginTop: "13px" }}
    >
      {/* Arka plan ikon mozaiği */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex flex-wrap content-center items-center justify-center gap-x-8 gap-y-8 p-6 opacity-[0.06] lg:gap-x-16 lg:gap-y-12 lg:p-10"
      >
        {Array.from({ length: 54 }).map((_, i) => {
          const Icon = MOSAIC_ICONS[i % MOSAIC_ICONS.length];
          return (
            <Icon
              key={i}
              className="h-10 w-10 shrink-0 lg:h-16 lg:w-16"
              strokeWidth={1.5}
              color="#dc2626"
              style={{ transform: `rotate(${((i * 47) % 44) - 22}deg)` }}
            />
          );
        })}
      </div>

      <div
        style={{ padding: "60px 28px 0" }}
        className="lg:!pt-[120px] lg:!px-0 w-full flex flex-col items-center"
      >
        <h2
          className="text-2xl lg:text-4xl text-center mb-3 z-10"
          style={{ fontWeight: 450, color: "#dc2626" }}
        >
          {t("home.cozumler.title")}
        </h2>
        <p
          className="text-sm lg:text-xl text-[#6e6e73] text-center z-10 px-4"
          style={{ marginBottom: "40px", fontWeight: 450 }}
        >
          {t("home.cozumler.desc")}
        </p>
      </div>

      <div className="z-10 flex flex-col items-center gap-6 px-6 pb-[60px] lg:gap-10 lg:pb-[120px]">
        <div className="flex flex-wrap justify-center gap-6 lg:gap-14">
          <Building2 className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
          <HomeIcon className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
          <Heart className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
          <Hammer className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
          <Hospital className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
        </div>
        <div className="flex flex-wrap justify-center gap-6 lg:gap-14">
          <Flame className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
          <Dumbbell className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
          <Factory className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
          <GraduationCap className="w-10 h-10 lg:w-[68px] lg:h-[68px]" strokeWidth={1.5} color="#dc2626" />
        </div>
        <Link
          href={lp("/cozumler")}
          className="mt-2 lg:mt-4 bg-[#dc2626] text-white text-sm lg:text-base font-medium transition-all duration-300 hover:bg-[#b91c1c]"
          style={{ padding: "10px 28px", borderRadius: "0", textDecoration: "none" }}
        >
          {t("home.cozumler.btn")}
        </Link>
      </div>
    </div>
  );
}
