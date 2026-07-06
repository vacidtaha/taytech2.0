"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

const ZOOM = 2.75;

export default function ProductImageZoom({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const { locale } = useLanguage();
  const isEn = locale === "EN";
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [lightbox, setLightbox] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  const openLabel = isEn ? "View product image in full screen" : "Ürün görselini tam ekran aç";
  const closeLabel = isEn ? "Close" : "Kapat";
  const desktopHint = isEn
    ? "Move mouse to inspect details · Click for full screen"
    : "Detay için fareyi gezdirin · Tam ekran için tıklayın";
  const mobileHint = isEn ? "Tap to inspect in full screen" : "Detay için dokunun";

  return (
    <>
      {/* Masaüstü: imleç konumunda yakınlaştırma */}
      <div className="relative mx-auto hidden w-full max-w-3xl md:block">
        <div
          role="button"
          tabIndex={0}
          aria-label={openLabel}
          className="relative aspect-[16/10] cursor-zoom-in overflow-hidden rounded-[28px] bg-[#f5f5f7]"
          onMouseEnter={() => setZooming(true)}
          onMouseLeave={() => {
            setZooming(false);
            setOrigin({ x: 50, y: 50 });
          }}
          onMouseMove={handleMove}
          onClick={() => setLightbox(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setLightbox(true);
            }
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="768px"
            draggable={false}
            className="object-contain p-14 transition-transform duration-150 ease-out will-change-transform"
            style={{
              transform: zooming ? `scale(${ZOOM})` : "scale(1)",
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />
        </div>
        <p className="mt-3 text-center text-[13px] text-[#86868b]">{desktopHint}</p>
      </div>

      {/* Mobil: dokunarak tam ekran */}
      <div className="relative mx-auto w-full max-w-3xl md:hidden">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label={openLabel}
          className="relative flex aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-[#f5f5f7]"
        >
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-contain p-5"
          />
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
            <ZoomIn size={18} />
          </span>
        </button>
        <p className="mt-2.5 text-center text-[13px] text-[#86868b]">{mobileHint}</p>
      </div>

      {/* Tam ekran inceleme */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label={closeLabel}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-6 md:top-6"
          >
            <X size={22} />
          </button>
          <div
            className="relative h-[min(85vh,900px)] w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}
