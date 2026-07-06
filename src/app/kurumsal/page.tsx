"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function KurumsalPage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("muhendislik");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["muhendislik", "rakamlar", "standartlar", "surdurulebilirlik", "destek"];
      const scrollPosition = window.scrollY + 300;
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && scrollPosition >= element.offsetTop) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const maddeler = Array.from({ length: 13 }, (_, i) => t(`corp.standartlar.madde${i + 1}`));

  // ===== MOBİL: Responsive kurumsal sayfa =====
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        {/* Sub-navigation bar - Mobile */}
        <div className="sticky top-[88px] z-[35] bg-white border-b border-gray-200">
          <div className="h-12 px-4 flex items-center">
            <span className="text-[16px] font-normal text-[#dc2626]">{t("corp.nav.taytech")}</span>
            <span className="ml-3 text-[16px] font-semibold text-[#dc2626]">{t("corp.nav.kurumsal")}</span>
          </div>
        </div>

        {/* Hero - Mobile */}
        <div id="muhendislik" className="w-full">
          <div className="w-full bg-[#f5f5f7] flex items-center justify-center" style={{ padding: '80px 28px' }}>
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-10" style={{ background: 'linear-gradient(to bottom right, #dc2626, #991b1b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2, paddingBottom: '0.12em' }}>
                {t("corp.hero.title")}
              </h1>
              <p className="text-base text-[#424245] leading-relaxed">{t("corp.hero.desc")}</p>
            </div>
          </div>
        </div>
        
        <div style={{ height: '100px' }}></div>
        
        <div className="flex items-center justify-center" style={{ padding: '0 28px', paddingBottom: '40px' }}>
          <Image src="/taytechdiscekim.webp" alt="Taytech" width={1000} height={625} className="w-full h-auto object-contain rounded-3xl" />
        </div>
        
        <div style={{ height: '100px' }}></div>
        
        {/* Rakamlar - Mobile */}
        <div id="rakamlar" style={{ padding: '0 28px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 className="text-2xl font-semibold text-[#dc2626]" style={{ marginBottom: '16px' }}>{t("corp.rakamlar.title")}</h2>
            <p className="text-base font-medium text-[#424245] leading-relaxed">{t("corp.rakamlar.desc")}</p>
          </div>
          <div className="flex flex-col" style={{ gap: '16px', marginBottom: '48px' }}>
            {[
              { val: "5.600 m²", label: "corp.rakamlar.alan", desc: "corp.rakamlar.alanDesc", bg: "linear-gradient(150deg, rgba(255,228,230,0.6) 0%, rgba(253,164,175,0.32) 100%)" },
              { val: "4.750 m²", label: "corp.rakamlar.uretim", desc: "corp.rakamlar.uretimDesc", bg: "linear-gradient(150deg, rgba(254,226,226,0.6) 0%, rgba(248,113,113,0.32) 100%)" },
              { val: "860 m²", label: "corp.rakamlar.arge", desc: "corp.rakamlar.argeDesc", bg: "linear-gradient(150deg, rgba(255,231,224,0.6) 0%, rgba(251,154,139,0.32) 100%)" },
            ].map((card, i) => (
              <div key={i} className="rounded-2xl relative overflow-hidden" style={{ padding: '32px 28px', background: card.bg, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.65)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), 0 16px 32px -14px rgba(220,38,38,0.35)' }}>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0))' }} />
                <div className="relative z-10">
                  <span className="text-4xl font-semibold text-[#dc2626] leading-none block">{card.val}</span>
                  <p className="text-xl text-[#dc2626] font-semibold" style={{ marginTop: '12px' }}>{t(card.label)}</p>
                  <p className="text-sm text-[#86868b] leading-relaxed font-medium" style={{ marginTop: '12px' }}>{t(card.desc)}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '36px' }}>
            <h3 className="text-2xl font-semibold text-[#dc2626]" style={{ marginBottom: '16px' }}>{t("corp.rakamlar.entegrasyon")}</h3>
            <p className="text-base font-medium text-[#424245] leading-relaxed">{t("corp.rakamlar.entegrasyonDesc")}</p>
          </div>
          <div style={{ marginBottom: '36px' }}>
            <h3 className="text-2xl font-semibold text-[#dc2626]" style={{ marginBottom: '16px' }}>{t("corp.rakamlar.makine")}</h3>
            <p className="text-base font-medium text-[#424245] leading-relaxed">{t("corp.rakamlar.makineDesc")}</p>
          </div>
        </div>
        
        <div style={{ height: '100px' }}></div>
        
        {/* Standartlar - Mobile */}
        <div id="standartlar" style={{ padding: '0 28px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 className="text-2xl font-semibold text-[#dc2626]" style={{ marginBottom: '16px' }}>{t("corp.standartlar.title")}</h2>
            <p className="text-base font-medium text-[#424245] leading-relaxed">{t("corp.standartlar.desc")}</p>
          </div>
          <div className="flex flex-col" style={{ gap: '14px', marginBottom: '36px' }}>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span className="text-sm font-semibold text-[#dc2626]">ISO 9001:2015</span>
              <span className="text-sm text-[#86868b]">{t("corp.standartlar.iso1")}</span>
            </div>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span className="text-sm font-semibold text-[#dc2626]">ISO 14001:2015</span>
              <span className="text-sm text-[#86868b]">{t("corp.standartlar.iso2")}</span>
            </div>
            <div className="flex items-center" style={{ gap: '12px' }}>
              <span className="text-sm font-semibold text-[#dc2626]">ISO 45001:2018</span>
              <span className="text-sm text-[#86868b]">{t("corp.standartlar.iso3")}</span>
            </div>
          </div>
          <div style={{ marginBottom: '36px' }}>
            <h3 className="text-2xl font-semibold text-[#dc2626]" style={{ marginBottom: '16px' }}>{t("corp.standartlar.mevzuat")}</h3>
            <p className="text-base font-medium text-[#424245] leading-relaxed">{t("corp.standartlar.mevzuatDesc")}</p>
          </div>
          <div style={{ marginBottom: '36px' }}>
            <h3 className="text-2xl font-semibold text-[#dc2626]" style={{ marginBottom: '16px' }}>{t("corp.standartlar.denetim")}</h3>
            <p className="text-base font-medium text-[#424245] leading-relaxed">{t("corp.standartlar.denetimDesc")}</p>
          </div>
          {/* Politika Belgesi - Mobile */}
          <div className="bg-white shadow-2xl relative" style={{ padding: '40px 28px', borderRadius: '4px', marginBottom: '20px' }}>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-red-600 rounded-tl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-red-600 rounded-tr"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-red-600 rounded-bl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-red-600 rounded-br"></div>
            <div className="flex justify-center" style={{ marginBottom: '24px' }}>
              <div className="flex items-center gap-2">
                <Image src="/taytechlogo.webp" alt="Taytech TR" width={120} height={68} className="h-10 w-auto" />
                <Image src="/taytechuklogo.webp" alt="Taytech UK" width={120} height={68} className="h-10 w-auto" />
              </div>
            </div>
            <h3 className="text-center font-bold text-[#dc2626]" style={{ fontSize: '16px', lineHeight: '1.4', marginBottom: '24px' }}>
              {t("corp.standartlar.politikaBaslik")}
            </h3>
            <div className="text-[#424245] leading-relaxed" style={{ fontSize: '12px' }}>
              <p style={{ marginBottom: '16px' }}>{t("corp.standartlar.politika1")}</p>
              <p style={{ marginBottom: '16px' }}>{t("corp.standartlar.politika2")}</p>
              <ul className="list-disc" style={{ paddingLeft: '20px', marginBottom: '16px' }}>
                {maddeler.map((madde, i) => (<li key={i} style={{ marginBottom: '8px' }}>{madde}</li>))}
              </ul>
              <p className="font-semibold" style={{ fontSize: '13px', marginBottom: '24px' }}>{t("corp.standartlar.taahhut")}</p>
              <div className="text-right" style={{ marginTop: '32px' }}>
                <p className="text-[#86868b] text-sm" style={{ marginBottom: '4px' }}>{t("corp.standartlar.imza")}</p>
                <p className="font-bold text-[#1d1d1f] text-base">{t("corp.standartlar.imzaAd")}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ height: '120px' }}></div>
        
        {/* Sürdürülebilirlik - Mobile (aynı kart tasarımı, 2 sütun grid) */}
        <div id="surdurulebilirlik" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ marginBottom: '24px', background: 'linear-gradient(to bottom right, #34c759, #248a3d)' }}>
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
            </div>
            <div className="text-center" style={{ marginBottom: '24px', padding: '0 28px' }}>
              <h2 className="text-2xl font-semibold" style={{ marginBottom: '12px', background: 'linear-gradient(to bottom right, #34c759, #248a3d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t("corp.surdurulebilirlik.title")}</h2>
              <p className="text-base text-[#86868b] font-medium">{t("corp.surdurulebilirlik.subtitle")}</p>
            </div>
            <div className="text-center" style={{ marginBottom: '40px', padding: '0 28px' }}>
              <p className="text-sm text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.desc")}</p>
            </div>
            <div className="grid grid-cols-2" style={{ gap: '12px', padding: '0 20px' }}>
              <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '16px 18px' }}>
                <svg className="w-6 h-6 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                <div><h3 className="text-sm font-semibold text-[#1d1d1f]" style={{ marginBottom: '4px' }}>{t("corp.surdurulebilirlik.ekonomi")}</h3><p style={{ fontSize: '11px' }} className="text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.ekonomiDesc")}</p></div>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre1.jpeg" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
              <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '16px 18px' }}>
                <svg className="w-6 h-6 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                <div><h3 className="text-sm font-semibold text-[#1d1d1f]" style={{ marginBottom: '4px' }}>{t("corp.surdurulebilirlik.yalin")}</h3><p style={{ fontSize: '11px' }} className="text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.yalinDesc")}</p></div>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre2.jpg" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre3.avif" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
              <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '16px 18px' }}>
                <svg className="w-6 h-6 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                <div><h3 className="text-sm font-semibold text-[#1d1d1f]" style={{ marginBottom: '4px' }}>{t("corp.surdurulebilirlik.kaynak")}</h3><p style={{ fontSize: '11px' }} className="text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.kaynakDesc")}</p></div>
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre4.jpg" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
              <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '16px 18px' }}>
                <svg className="w-6 h-6 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><path d="M12 22v-7"/><path d="M9 22h6"/><path d="M12 15a5 5 0 0 0 5-5c0-2-1-3-2-4l1-3-3 1-1-2-1 2-3-1 1 3c-1 1-2 2-2 4a5 5 0 0 0 5 5z"/></svg>
                <div><h3 className="text-sm font-semibold text-[#1d1d1f]" style={{ marginBottom: '4px' }}>{t("corp.surdurulebilirlik.gelecek")}</h3><p style={{ fontSize: '11px' }} className="text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.gelecekDesc")}</p></div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ height: '120px' }}></div>
        
        {/* Tam Destek - Mobile (aynı kart tasarımı, dikey düzen) */}
        <div id="destek" className="overflow-hidden" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
          <div className="flex flex-col items-center" style={{ padding: '0 28px' }}>
            <div className="flex flex-col items-center justify-center text-center" style={{ marginBottom: '36px' }}>
              <div className="w-16 h-16 bg-[#0066cc] rounded-2xl flex items-center justify-center" style={{ marginBottom: '24px' }}>
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h2 className="text-4xl font-bold text-[#0066cc]" style={{ marginBottom: '12px' }}>{t("corp.destek.title")}</h2>
              <p className="text-lg text-[#0066cc]/70 font-semibold">{t("corp.destek.subtitle")}</p>
            </div>
            <div className="text-center" style={{ marginBottom: '40px' }}>
              <p className="text-base text-[#1d1d1f] leading-relaxed font-medium">{t("corp.destek.desc")}</p>
            </div>
            <div className="w-full flex flex-col" style={{ gap: '14px' }}>
              <div className="bg-[#0077b6] rounded-2xl flex flex-col justify-center" style={{ padding: '36px 28px' }}>
                <svg className="w-10 h-10" style={{ marginBottom: '16px' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                <h3 className="text-xl font-bold text-white" style={{ marginBottom: '12px' }}>{t("corp.destek.danismanlik")}</h3>
                <p className="text-sm text-white/90 leading-relaxed font-medium">{t("corp.destek.danismanlikDesc")}</p>
              </div>
              <div className="grid grid-cols-2" style={{ gap: '14px' }}>
                <div className="bg-[#0096c7] rounded-2xl flex flex-col justify-center" style={{ padding: '28px 20px' }}>
                  <svg className="w-8 h-8" style={{ marginBottom: '12px' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  <h3 className="text-base font-bold text-white" style={{ marginBottom: '8px' }}>{t("corp.destek.hizli")}</h3>
                  <p style={{ fontSize: '11px' }} className="text-white/90 font-medium">{t("corp.destek.hizliDesc")}</p>
                </div>
                <div className="bg-[#00b4d8] rounded-2xl flex flex-col justify-center" style={{ padding: '28px 20px' }}>
                  <svg className="w-8 h-8" style={{ marginBottom: '12px' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <h3 className="text-base font-bold text-white" style={{ marginBottom: '8px' }}>{t("corp.destek.satisSonrasi")}</h3>
                  <p style={{ fontSize: '11px' }} className="text-white/90 font-medium">{t("corp.destek.satisSonrasiDesc")}</p>
                </div>
              </div>
              <div className="bg-[#48cae4] rounded-2xl flex items-center" style={{ gap: '16px', padding: '28px 24px' }}>
                <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ marginBottom: '6px' }}>{t("corp.destek.kadro")}</h3>
                  <p className="text-sm text-white/90 font-medium">{t("corp.destek.kadroDesc")}</p>
                </div>
              </div>
              <div className="bg-[#90e0ef] rounded-2xl flex items-center" style={{ gap: '16px', padding: '28px 24px' }}>
                <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <div>
                  <h3 className="text-lg font-bold text-white" style={{ marginBottom: '6px' }}>{t("corp.destek.rekabet")}</h3>
                  <p className="text-sm text-white/90 font-medium">{t("corp.destek.rekabetDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ height: '80px' }}></div>
      </div>
    );
  }

  // ===== MASAÜSTÜ: Orijinal kurumsal sayfası (hiç değişmedi) =====
  return (
    <div className="min-h-screen bg-white">
      {/* Sub-navigation bar - Desktop */}
      <div className="sticky top-[88px] z-[35] bg-white border-b border-gray-200">
        <div className="h-12 flex items-center justify-between" style={{ paddingLeft: 'calc(25vw - 224px + 32px)', paddingRight: '32px' }}>
          <div className="flex items-center">
            <span className="text-[21px] font-normal text-[#dc2626]">{t("corp.nav.taytech")}</span>
            <span className="ml-2 text-[21px] font-semibold text-[#dc2626]">{t("corp.nav.kurumsal")}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8" style={{ marginRight: '100px' }}>
            {[
              { id: "muhendislik", key: "corp.nav.muhendislik" },
              { id: "rakamlar", key: "corp.nav.rakamlar" },
              { id: "standartlar", key: "corp.nav.standartlar" },
              { id: "surdurulebilirlik", key: "corp.nav.surdurulebilirlik" },
              { id: "destek", key: "corp.nav.destek" },
            ].map((item) => (
              <a key={item.id} href={`#${item.id}`} className={`text-[13px] transition-colors ${activeSection === item.id ? "font-medium text-[#dc2626]" : "text-[#424245] hover:text-[#dc2626]"}`}>
                {t(item.key)}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div id="muhendislik" className="w-full">
        <div className="w-full h-[550px] bg-[#f5f5f7] flex items-center justify-center">
          <div className="max-w-3xl text-center px-8">
            <h1 className="text-4xl md:text-5xl font-semibold mb-14" style={{ background: 'linear-gradient(to bottom right, #dc2626, #991b1b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.2, paddingBottom: '0.12em' }}>
              {t("corp.hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-[#424245] leading-relaxed">{t("corp.hero.desc")}</p>
          </div>
        </div>
      </div>
      
      <div className="h-[120px] bg-white"></div>
      
      <div className="bg-white pb-20 flex items-center justify-center px-12">
        <div className="w-full max-w-7xl rounded-[2.5rem] overflow-hidden">
          <Image src="/taytechdiscekim.webp" alt="Taytech" width={1400} height={875} className="w-full h-auto object-cover" />
        </div>
      </div>
      
      <div className="h-[120px] bg-white"></div>
      
      {/* Rakamlar */}
      <div id="rakamlar" className="bg-white">
        <div className="grid grid-cols-2">
          <div className="py-20 flex justify-center">
            <div className="sticky top-[30vh] h-fit max-w-md px-8 flex flex-col" style={{ gap: '80px' }}>
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-[#dc2626] mb-6">{t("corp.rakamlar.title")}</h2>
                <p className="text-xl font-medium text-[#424245] leading-relaxed">{t("corp.rakamlar.desc")}</p>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-[#dc2626] mb-6">{t("corp.rakamlar.entegrasyon")}</h3>
                <p className="text-xl font-medium text-[#424245] leading-relaxed">{t("corp.rakamlar.entegrasyonDesc")}</p>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-[#dc2626] mb-6">{t("corp.rakamlar.makine")}</h3>
                <p className="text-xl font-medium text-[#424245] leading-relaxed">{t("corp.rakamlar.makineDesc")}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center px-8" style={{ paddingTop: '100vh', paddingBottom: '300px' }}>
            {[
              { val: "5.600 m²", label: "corp.rakamlar.alan", desc: "corp.rakamlar.alanDesc", bg: "linear-gradient(150deg, rgba(255,228,230,0.55) 0%, rgba(253,164,175,0.30) 100%)", z: 10 },
              { val: "4.750 m²", label: "corp.rakamlar.uretim", desc: "corp.rakamlar.uretimDesc", bg: "linear-gradient(150deg, rgba(254,226,226,0.55) 0%, rgba(248,113,113,0.30) 100%)", z: 20 },
              { val: "860 m²", label: "corp.rakamlar.arge", desc: "corp.rakamlar.argeDesc", bg: "linear-gradient(150deg, rgba(255,231,224,0.55) 0%, rgba(251,154,139,0.30) 100%)", z: 30 },
            ].map((card, i) => (
              <div key={i} style={{ zIndex: card.z, position: 'sticky', top: 'calc(50vh - 266px)', height: '633px' }}>
                <div className="rounded-3xl relative overflow-hidden" style={{ width: '400px', height: '533px', padding: '48px 40px 40px 40px', background: card.bg, backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)', border: '1px solid rgba(255,255,255,0.65)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), inset 0 -10px 30px rgba(255,255,255,0.25), 0 24px 50px -18px rgba(220,38,38,0.35)' }}>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0))' }} />
                  <div className="relative z-10">
                    <span className="text-7xl font-semibold text-[#dc2626] leading-none block">{card.val}</span>
                    <p className="text-3xl text-[#dc2626] mt-6 font-semibold">{t(card.label)}</p>
                    <p className="text-lg text-[#86868b] mt-6 leading-relaxed font-medium">{t(card.desc)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-[400px] bg-white"></div>
      
      {/* Standartlar */}
      <div id="standartlar" className="bg-white">
        <div className="grid grid-cols-2">
          <div className="py-20 flex justify-center">
            <div className="sticky top-[15vh] h-fit max-w-md px-8 flex flex-col" style={{ gap: '60px' }}>
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold text-[#dc2626] mb-6">{t("corp.standartlar.title")}</h2>
                <p className="text-xl font-medium text-[#424245] leading-relaxed">{t("corp.standartlar.desc")}</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-[#dc2626]">ISO 9001:2015</span>
                  <span className="text-lg text-[#86868b]">{t("corp.standartlar.iso1")}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-[#dc2626]">ISO 14001:2015</span>
                  <span className="text-lg text-[#86868b]">{t("corp.standartlar.iso2")}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-semibold text-[#dc2626]">ISO 45001:2018</span>
                  <span className="text-lg text-[#86868b]">{t("corp.standartlar.iso3")}</span>
                </div>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-[#dc2626] mb-6">{t("corp.standartlar.mevzuat")}</h3>
                <p className="text-xl font-medium text-[#424245] leading-relaxed">{t("corp.standartlar.mevzuatDesc")}</p>
              </div>
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-[#dc2626] mb-6">{t("corp.standartlar.denetim")}</h3>
                <p className="text-xl font-medium text-[#424245] leading-relaxed">{t("corp.standartlar.denetimDesc")}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center px-8" style={{ paddingTop: '70vh', paddingBottom: '300px' }}>
            <div className="sticky top-[5vh] z-10">
              <div className="bg-white shadow-2xl relative" style={{ width: '850px', padding: '70px 80px', borderRadius: '4px' }}>
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-red-600 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-red-600 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-red-600 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-red-600 rounded-br"></div>
                <div className="flex justify-center mb-10 -mt-2">
                  <div className="flex items-center gap-3">
                    <Image src="/taytechlogo.webp" alt="Taytech TR" width={160} height={90} className="h-12 w-auto" />
                    <Image src="/taytechuklogo.webp" alt="Taytech UK" width={160} height={90} className="h-12 w-auto" />
                  </div>
                </div>
                <h3 className="text-center font-bold text-[#dc2626] mb-10" style={{ fontSize: '24px', lineHeight: '1.4' }}>
                  {t("corp.standartlar.politikaBaslik")}
                </h3>
                <div className="text-[#424245] leading-relaxed" style={{ fontSize: '14px' }}>
                  <p className="mb-6">{t("corp.standartlar.politika1")}</p>
                  <p className="mb-6">{t("corp.standartlar.politika2")}</p>
                  <ul className="list-disc pl-6 space-y-3 mb-6">
                    {maddeler.map((madde, i) => (<li key={i}>{madde}</li>))}
                  </ul>
                  <p className="mb-10 font-semibold text-[15px]">{t("corp.standartlar.taahhut")}</p>
                  <div className="text-right mt-12">
                    <p className="text-[#86868b] text-base mb-1">{t("corp.standartlar.imza")}</p>
                    <p className="font-bold text-[#1d1d1f] text-xl">{t("corp.standartlar.imzaAd")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-[200px] bg-white"></div>
      
      {/* Sürdürülebilirlik */}
      <div id="surdurulebilirlik" className="bg-white py-20">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ marginBottom: '30px', background: 'linear-gradient(to bottom right, #34c759, #248a3d)' }}>
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4" style={{ background: 'linear-gradient(to bottom right, #34c759, #248a3d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t("corp.surdurulebilirlik.title")}</h2>
            <p className="text-2xl text-[#86868b] font-medium">{t("corp.surdurulebilirlik.subtitle")}</p>
          </div>
          <div className="max-w-3xl text-center px-8" style={{ marginBottom: '60px' }}>
            <p className="text-xl text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.desc")}</p>
          </div>
          <div className="grid grid-cols-4 gap-4 max-w-6xl">
            <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '24px 28px' }}>
              <svg className="w-8 h-8 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <div><h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">{t("corp.surdurulebilirlik.ekonomi")}</h3><p className="text-sm text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.ekonomiDesc")}</p></div>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre1.jpeg" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
            <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '24px 28px' }}>
              <svg className="w-8 h-8 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
              <div><h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">{t("corp.surdurulebilirlik.yalin")}</h3><p className="text-sm text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.yalinDesc")}</p></div>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre2.jpg" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre3.avif" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
            <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '24px 28px' }}>
              <svg className="w-8 h-8 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
              <div><h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">{t("corp.surdurulebilirlik.kaynak")}</h3><p className="text-sm text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.kaynakDesc")}</p></div>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden"><Image src="/cevre4.jpg" alt="Çevre" width={400} height={300} className="w-full h-full object-cover" /></div>
            <div className="aspect-[4/3] bg-[#f5f5f7] rounded-2xl flex flex-col" style={{ padding: '24px 28px' }}>
              <svg className="w-8 h-8 mb-auto" viewBox="0 0 24 24" fill="none" stroke="rgb(98,214,105)" strokeWidth="1.5"><path d="M12 22v-7"/><path d="M9 22h6"/><path d="M12 15a5 5 0 0 0 5-5c0-2-1-3-2-4l1-3-3 1-1-2-1 2-3-1 1 3c-1 1-2 2-2 4a5 5 0 0 0 5 5z"/></svg>
              <div><h3 className="text-xl font-semibold text-[#1d1d1f] mb-3">{t("corp.surdurulebilirlik.gelecek")}</h3><p className="text-sm text-[#424245] leading-relaxed">{t("corp.surdurulebilirlik.gelecekDesc")}</p></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-[200px] bg-white"></div>
      
      {/* Tam Destek */}
      <div id="destek" className="bg-white py-32 overflow-hidden">
        <div className="flex flex-col items-center px-8">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <div className="w-20 h-20 bg-[#0066cc] rounded-2xl flex items-center justify-center" style={{ marginBottom: '30px' }}>
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h2 className="text-6xl md:text-8xl font-bold text-[#0066cc] mb-4">{t("corp.destek.title")}</h2>
            <p className="text-2xl md:text-3xl text-[#0066cc]/70 font-semibold">{t("corp.destek.subtitle")}</p>
          </div>
          <div className="max-w-3xl mx-auto text-center" style={{ marginBottom: '60px' }}>
            <p className="text-xl text-[#1d1d1f] leading-relaxed font-medium">{t("corp.destek.desc")}</p>
          </div>
          <div className="grid grid-cols-4 grid-rows-2 gap-4 w-full max-w-5xl" style={{ height: '600px' }}>
            <div className="col-span-2 row-span-2 bg-[#0077b6] rounded-3xl flex flex-col justify-center relative overflow-hidden" style={{ padding: '48px' }}>
              <svg className="w-12 h-12 mb-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <h3 className="text-3xl font-bold text-white mb-4">{t("corp.destek.danismanlik")}</h3>
              <p className="text-lg text-white/90 leading-relaxed font-medium">{t("corp.destek.danismanlikDesc")}</p>
            </div>
            <div className="col-span-1 row-span-1 bg-[#0096c7] rounded-3xl flex flex-col justify-center relative overflow-hidden" style={{ padding: '28px' }}>
              <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              <h3 className="text-xl font-bold text-white mb-2">{t("corp.destek.hizli")}</h3>
              <p className="text-sm text-white/90 font-medium">{t("corp.destek.hizliDesc")}</p>
            </div>
            <div className="col-span-1 row-span-1 bg-[#00b4d8] rounded-3xl flex flex-col justify-center relative overflow-hidden" style={{ padding: '28px' }}>
              <svg className="w-10 h-10 mb-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <h3 className="text-xl font-bold text-white mb-2">{t("corp.destek.satisSonrasi")}</h3>
              <p className="text-sm text-white/90 font-medium">{t("corp.destek.satisSonrasiDesc")}</p>
            </div>
            <div className="col-span-2 row-span-1 bg-[#48cae4] rounded-3xl flex items-center gap-6 relative overflow-hidden" style={{ padding: '32px' }}>
              <svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{t("corp.destek.kadro")}</h3>
                <p className="text-base text-white/90 font-medium">{t("corp.destek.kadroDesc")}</p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-5xl" style={{ marginTop: '16px' }}>
            <div className="bg-[#90e0ef] rounded-3xl flex items-center justify-center gap-6" style={{ height: '200px', padding: '32px 48px' }}>
              <svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{t("corp.destek.rekabet")}</h3>
                <p className="text-base text-white/90 font-medium">{t("corp.destek.rekabetDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-[100px] bg-white"></div>
    </div>
  );
}
