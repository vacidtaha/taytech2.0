"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const VIDEO_SRC = "/taytechscvideo2.mp4";
const FALLBACK_DURATION = 40.2;
const SCRUB_EASING = 0.12;
const SEEK_EPSILON = 0.01;

/**
 * Video bir kez tamamen indikten sonra bellekte (blob) tutulur.
 * Sayfalar arası gezinmede bileşen yeniden kurulsa bile video ağa/diske
 * gitmeden, ilk andan tamamen tamponlanmış başlar — scroll takılmaz.
 */
let warmSrc: string | null = null;
let warming = false;

function warmUpVideo() {
  if (warmSrc || warming || typeof window === "undefined") return;
  warming = true;
  fetch(VIDEO_SRC)
    .then((r) => (r.ok ? r.blob() : Promise.reject()))
    .then((blob) => {
      warmSrc = URL.createObjectURL(blob);
    })
    .catch(() => {
      warming = false; // bir dahaki ziyarette yeniden dene
    });
}

export default function HomeScrollVideo() {
  const { t } = useLanguage();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(FALLBACK_DURATION);
  const targetTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  // İlk ziyarette normal URL (kademeli indirme); sonraki kurulumlarda blob.
  const [src] = useState(() => warmSrc ?? VIDEO_SRC);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;

    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        durationRef.current = video.duration;
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) onMeta();

    // Video tamamen indiğinde (HTTP önbelleğinden okunur, ikinci indirme olmaz)
    // blob'a al: sonraki sayfa geçişlerinde sıfır bekleme.
    const onProgress = () => {
      if (warmSrc || warming) return;
      try {
        const end = video.buffered.length
          ? video.buffered.end(video.buffered.length - 1)
          : 0;
        if (end >= durationRef.current - 0.5) warmUpVideo();
      } catch {
        /* buffered henüz hazır değil */
      }
    };
    video.addEventListener("progress", onProgress);
    onProgress();

    const computeProgress = () => {
      const rect = wrapper.getBoundingClientRect();
      const scrollable = wrapper.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      // rect.top goes from 0 (pinned start) down to -scrollable (pinned end).
      const p = -rect.top / scrollable;
      return Math.min(1, Math.max(0, p));
    };

    const step = () => {
      // Chrome: önceki seek bitmeden yenisini vermek kare atlatıp takılmaya
      // yol açar. Seek sürüyorsa bu kareyi bekle, sonraki karede devam et.
      if (video.seeking) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      const target = targetTimeRef.current;
      const current = video.currentTime;
      const diff = target - current;
      if (Math.abs(diff) > SEEK_EPSILON) {
        // Smoothly approach the target for buttery scrubbing.
        const next = current + diff * SCRUB_EASING;
        try {
          video.currentTime = Math.abs(target - next) < SEEK_EPSILON ? target : next;
        } catch {
          // ignore transient seek errors while metadata loads
        }
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };

    const scheduleStep = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        targetTimeRef.current = computeProgress() * durationRef.current;
        scheduleStep();
        // Bölüm ekranı kapladığında (pinliyken) header'ı gizlemek için olay yayınla.
        const rect = wrapper.getBoundingClientRect();
        const active = rect.top <= 0 && rect.bottom > window.innerHeight;
        if (active !== activeRef.current) {
          activeRef.current = active;
          window.dispatchEvent(
            new CustomEvent("taytech:scrollvideo", { detail: active })
          );
        }
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("progress", onProgress);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.dispatchEvent(
        new CustomEvent("taytech:scrollvideo", { detail: false })
      );
    };
  }, []);

  return (
    <section
      ref={wrapperRef}
      className="relative mt-[8px] w-full bg-black lg:mt-[13px]"
      style={{ height: "350vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={src}
          poster="/scrollposter.jpg"
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Üstte siyah, aşağı doğru şeffafa geçen vinyet + başlık */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-20 pb-44 text-center md:pt-24"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, #000 0%, #000 35%, rgba(0,0,0,0.72) 62%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            {t("home.scrollvideo.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-medium text-white/70 md:text-xl">
            {t("home.scrollvideo.subtitle")}
          </p>
        </div>
      </div>
    </section>
  );
}
