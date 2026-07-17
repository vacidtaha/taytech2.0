"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

const cozumlerData = [
  { nameKey: "cozumler.ticari", descKey: "cozumler.ticariDesc", slug: "ticari-tesisler", image: "/akıllıbina.webp" },
  { nameKey: "cozumler.toplu", descKey: "cozumler.topluDesc", slug: "toplu-konutlar", image: "/akıllısehir.webp" },
  { nameKey: "cozumler.bakim", descKey: "cozumler.bakimDesc", slug: "bakim-huzur-evleri", image: "/bakimevi.jpg" },
  { nameKey: "cozumler.yeni", descKey: "cozumler.yeniDesc", slug: "yeni-projeler", image: "/konferans.webp" },
  { nameKey: "cozumler.hastane", descKey: "cozumler.hastaneDesc", slug: "hastaneler", image: "/hastane.webp" },
  { nameKey: "cozumler.kazan", descKey: "cozumler.kazanDesc", slug: "endustriyel-kazan-dairesi", image: "/kazan-dairesi.webp" },
  { nameKey: "cozumler.spor", descKey: "cozumler.sporDesc", slug: "spor-eglence-tesisleri", image: "/spor-tesisi.jpg" },
  { nameKey: "cozumler.saha", descKey: "cozumler.sahaDesc", slug: "saha-disi-uretim", image: "/akıllıtasıma.jpg" },
  { nameKey: "cozumler.egitim", descKey: "cozumler.egitimDesc", slug: "egitim-yapilari", image: "/okul.jpg" },
];

export default function CozumlerPage() {
  const { t, lp } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Desktop scroll check
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Mobile scroll check
  const checkMobileScroll = () => {
    if (mobileScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    if (isMobile) {
      const el = mobileScrollRef.current;
      if (el) {
        el.addEventListener('scroll', checkMobileScroll);
        checkMobileScroll();
        return () => el.removeEventListener('scroll', checkMobileScroll);
      }
    } else {
      const el = scrollRef.current;
      if (el) {
        el.addEventListener('scroll', checkScroll);
        checkScroll();
        return () => el.removeEventListener('scroll', checkScroll);
      }
    }
  }, [isMobile]);

  const scroll = (direction: 'left' | 'right') => {
    const ref = isMobile ? mobileScrollRef : scrollRef;
    const amount = isMobile ? 296 : 400;
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  // ===== MOBİL: Responsive çözümler sayfası (masaüstüyle aynı tasarım, mobil boyutlarla) =====
  if (isMobile) {
    return (
      <div className="bg-[#f5f5f7] pt-12">
        {/* Başlık - Mobile */}
        <div style={{ paddingTop: '40px', paddingBottom: '16px', paddingLeft: '20px', paddingRight: '20px' }}>
          <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px', lineHeight: 1.15 }}>
            {t("cozumler.title")}
          </h1>
          <p style={{ fontSize: '16px', color: '#1d1d1f', lineHeight: 1.6 }}>
            {t("cozumler.desc")}
          </p>
        </div>
        
        {/* Hero Görsel - Mobile */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', padding: '0 20px' }}>
          <div style={{ width: '100%', height: '240px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 15px 30px -8px rgba(0, 0, 0, 0.12)' }}>
            <Image 
              src="/hero2.webp"
              alt="Hero"
              width={768}
              height={400}
              style={{ objectFit: 'cover', transform: 'scale(1.2)', width: '100%', height: '100%' }}
            />
          </div>
        </div>
        
        {/* Çözümler Carousel - Mobile (yatay sürükleme) */}
        <div style={{ marginTop: '56px', position: 'relative' }}>
          {/* Oklar - Kartların üstünde */}
          <div style={{ paddingLeft: '20px', paddingRight: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: canScrollLeft ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)', 
                  border: `1px solid ${canScrollLeft ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                  opacity: canScrollLeft ? 1 : 0.4
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button 
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: canScrollRight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)', 
                  border: `1px solid ${canScrollRight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: canScrollRight ? 'pointer' : 'not-allowed',
                  opacity: canScrollRight ? 1 : 0.4
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          {/* Kartlar - Yatay Scroll (ilk kart ortada) */}
          <div 
            ref={mobileScrollRef}
            style={{ 
              display: 'flex', gap: '16px', overflowX: 'auto', 
              paddingRight: '40px', paddingBottom: '20px',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            className="hide-scrollbar"
          >
            {cozumlerData.map((cozum, index) => (
              <Link 
                key={index}
                href={lp(`/cozumler/${cozum.slug}`)}
                style={{ 
                  minWidth: '280px', maxWidth: '280px', aspectRatio: '3/4', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  border: '1px solid rgba(0,0,0,0.08)', textDecoration: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  marginLeft: index === 0 ? 'calc(50vw - 140px)' : '0'
                }}
              >
                {/* Üst - Fotoğraf */}
                <div style={{ height: '50%', position: 'relative', overflow: 'hidden' }}>
                  <Image src={cozum.image} alt={t(cozum.nameKey)} fill style={{ objectFit: 'cover' }} />
                </div>
                {/* Alt - İçerik */}
                <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>{t(cozum.nameKey)}</h3>
                  <p style={{ color: '#86868b', fontSize: '13px', lineHeight: 1.5, marginBottom: '10px', flex: 1 }}>{t(cozum.descKey)}</p>
                  <p style={{ color: '#dc2626', fontSize: '13px', fontWeight: 500 }}>{t("cozumler.detay")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Boşluk */}
        <div style={{ height: '15vh' }}></div>
      </div>
    );
  }

  // ===== MASAÜSTÜ: Orijinal çözümler sayfası (hiç değişmedi) =====
  return (
    <div className="bg-[#f5f5f7] pt-12">
      {/* Başlık */}
      <div style={{ paddingTop: '80px', paddingBottom: '20px', paddingLeft: 'calc(50vw - 500px)', paddingRight: 'calc(50vw - 500px)' }}>
        <h1 className="text-5xl md:text-6xl font-bold text-[#1d1d1f]" style={{ marginBottom: '24px' }}>
          {t("cozumler.title")}
        </h1>
        <p className="text-xl text-[#1d1d1f] leading-relaxed" style={{ maxWidth: '800px' }}>
          {t("cozumler.desc")}
        </p>
      </div>
      
      {/* Hero Görsel */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        <div style={{ width: '1000px', height: '380px', borderRadius: '48px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}>
          <Image 
            src="/hero2.webp"
            alt="Hero"
            width={800}
            height={400}
            style={{ objectFit: 'cover', transform: 'scale(1.2)', width: '100%', height: '100%' }}
          />
        </div>
      </div>
      
      {/* Çözümler Carousel */}
      <div style={{ marginTop: '96px', position: 'relative' }}>
        {/* Oklar */}
        <div style={{ paddingLeft: 'calc(50vw - 500px)', marginBottom: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingRight: 'calc(50vw - 500px)' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                backgroundColor: canScrollLeft ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)', 
                border: `1px solid ${canScrollLeft ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                opacity: canScrollLeft ? 1 : 0.4
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                backgroundColor: canScrollRight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.02)', 
                border: `1px solid ${canScrollRight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: canScrollRight ? 'pointer' : 'not-allowed',
                opacity: canScrollRight ? 1 : 0.4
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d1d1f" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
        
        {/* Kartlar */}
        <div 
          ref={scrollRef}
          style={{ 
            display: 'flex', gap: '20px', overflowX: 'auto', 
            paddingLeft: 'calc(50vw - 500px)', paddingRight: '100px', paddingBottom: '20px',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
          }}
          className="hide-scrollbar"
        >
          {cozumlerData.map((cozum, index) => (
            <Link 
              key={index}
              href={lp(`/cozumler/${cozum.slug}`)}
              style={{ 
                minWidth: '400px', aspectRatio: '3/4', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                border: '1px solid rgba(0,0,0,0.08)', textDecoration: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
              className="group"
            >
              {/* Üst - Fotoğraf */}
              <div style={{ height: '50%', position: 'relative', overflow: 'hidden' }}>
                <Image src={cozum.image} alt={t(cozum.nameKey)} fill style={{ objectFit: 'cover' }} />
              </div>
              {/* Alt - İçerik */}
              <div 
                style={{ flex: 1, backgroundColor: 'white', padding: '28px 32px 32px', transition: 'background-color 0.3s', display: 'flex', flexDirection: 'column' }}
                className="group-hover:bg-[#f5f5f7]"
              >
                <h3 className="text-2xl font-semibold text-[#1d1d1f] mb-3 group-hover:text-[#dc2626] transition-colors">{t(cozum.nameKey)}</h3>
                <p className="text-[#86868b] text-[15px] leading-relaxed mb-4" style={{ flex: 1 }}>{t(cozum.descKey)}</p>
                <p className="text-[#86868b] text-sm font-medium group-hover:text-[#dc2626] transition-colors">{t("cozumler.detay")}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Boşluk */}
      <div style={{ height: '25vh' }}></div>
    </div>
  );
}
