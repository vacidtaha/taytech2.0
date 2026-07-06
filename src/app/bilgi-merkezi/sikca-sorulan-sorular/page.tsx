"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";

// FAQ yapısı - anahtarlar çeviri dosyalarından çekilir
const faqStructure = [
  { catKey: "sss.cat.genel", keys: ["sss.g1", "sss.g2", "sss.g3", "sss.g4"] },
  { catKey: "sss.cat.urunler", keys: ["sss.u1", "sss.u2", "sss.u3", "sss.u4", "sss.u5", "sss.u6"] },
  { catKey: "sss.cat.teknik", keys: ["sss.t1", "sss.t2", "sss.t3", "sss.t4"] },
  { catKey: "sss.cat.cozumler", keys: ["sss.c1", "sss.c2", "sss.c3"] },
];

export default function SikcaSorulanSorular() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<string | null>("sss.g1");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggle = (id: string) => setOpenIndex(openIndex === id ? null : id);

  const faqs = faqStructure.map(section => ({
    category: t(section.catKey),
    catKey: section.catKey,
    questions: section.keys.map(key => ({ q: t(`${key}.q`), a: t(`${key}.a`), key })),
  }));

  const filteredFaqs = activeCategory
    ? faqs.filter(f => f.catKey === activeCategory)
    : faqs;

  // ===== MOBİL: Responsive SSS sayfası =====
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        {/* Başlık - Mobile */}
        <div style={{ padding: "40px 20px 0" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>{t("sss.bilgiMerkezi")}</p>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1d1d1f", lineHeight: 1.15, marginBottom: "12px" }}>{t("sss.title")}</h1>
          <p style={{ fontSize: "16px", color: "#86868b", fontWeight: 450, lineHeight: 1.6 }}>
            {t("sss.desc")}
          </p>
        </div>

        {/* Ayraç - Mobile */}
        <div style={{ margin: "28px 20px", height: "1px", background: "#e5e5e5" }} />

        {/* Kategori Filtre - Mobile (yatay scroll) */}
        <div style={{ padding: "0 20px", marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#1d1d1f", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
            {t("sss.kategoriler")}
          </p>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "8px", WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => setActiveCategory(null)}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: !activeCategory ? 600 : 400,
                color: !activeCategory ? "white" : "#424245",
                background: !activeCategory ? "#dc2626" : "#f5f5f7",
                border: "none",
                borderRadius: "980px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {t("sss.tumu")}
            </button>
            {faqs.map((section) => (
              <button
                key={section.catKey}
                onClick={() => setActiveCategory(activeCategory === section.catKey ? null : section.catKey)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: activeCategory === section.catKey ? 600 : 400,
                  color: activeCategory === section.catKey ? "white" : "#424245",
                  background: activeCategory === section.catKey ? "#dc2626" : "#f5f5f7",
                  border: "none",
                  borderRadius: "980px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >
                {section.category} ({section.questions.length})
              </button>
            ))}
          </div>
        </div>

        {/* Sorular - Mobile */}
        <div style={{ padding: "0 20px 32px" }}>
          {filteredFaqs.map((section) => (
            <div key={section.category} style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", paddingBottom: "10px", borderBottom: "2px solid #dc2626" }}>
                {section.category}
              </h2>
              <div>
                {section.questions.map((item) => {
                  const id = item.key;
                  const isOpen = openIndex === id;
                  return (
                    <div key={id}>
                      <button
                        onClick={() => toggle(id)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "16px 0",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <span style={{ fontSize: "15px", fontWeight: 500, color: isOpen ? "#dc2626" : "#1d1d1f", transition: "color 0.2s", lineHeight: 1.4 }}>
                          {item.q}
                        </span>
                        <span style={{
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "transform 0.3s",
                          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <line x1="8" y1="2" x2="8" y2="14" stroke={isOpen ? "#dc2626" : "#86868b"} strokeWidth="1.5" />
                            <line x1="2" y1="8" x2="14" y2="8" stroke={isOpen ? "#dc2626" : "#86868b"} strokeWidth="1.5" />
                          </svg>
                        </span>
                      </button>
                      <div style={{
                        maxHeight: isOpen ? "500px" : "0",
                        overflow: "hidden",
                        transition: "max-height 0.4s ease, opacity 0.3s ease",
                        opacity: isOpen ? 1 : 0,
                      }}>
                        <p style={{ fontSize: "14px", color: "#424245", lineHeight: 1.8, paddingBottom: "20px", paddingRight: "20px" }}>
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* İletişim CTA - Mobile */}
        <div style={{ padding: "0 20px 40px" }}>
          <div style={{ padding: "24px", background: "#f5f5f7", borderRadius: "12px" }}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1f", marginBottom: "8px" }}>{t("sss.sorunuz")}</p>
            <p style={{ fontSize: "13px", color: "#86868b", lineHeight: 1.5, marginBottom: "16px" }}>{t("sss.sorunuzDesc")}</p>
            <Link
              href="/iletisim"
              style={{
                display: "inline-block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#dc2626",
                textDecoration: "none",
              }}
            >
              {t("sss.iletisim")}
            </Link>
          </div>
        </div>

      </div>
    );
  }

  // ===== MASAÜSTÜ: Orijinal SSS sayfası (hiç değişmedi) =====
  return (
    <div className="min-h-screen bg-white" style={{ position: "relative", overflow: "hidden" }}>
      {/* Gradyan Dekor (iletişim ile bizzat aynı png, soldan sağa tam) */}
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
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* Gradyan Dekor - Alt (aynı png, ters çevrilmiş) */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
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
          style={{
            width: "100%",
            height: "auto",
            transform: "scaleY(-1)",
            filter: "hue-rotate(140deg) saturate(1.2)",
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* İçerik (gradyanın üstünde) */}
      <div style={{ position: "relative", zIndex: 1 }}>
      {/* Başlık */}
      <div style={{ padding: "56px 200px 0" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>{t("sss.bilgiMerkezi")}</p>
        <h1 style={{ fontSize: "56px", fontWeight: 700, color: "#1d1d1f", lineHeight: 1.1, marginBottom: "16px" }}>{t("sss.title")}</h1>
        <p style={{ fontSize: "20px", color: "#1d1d1f", fontWeight: 450, maxWidth: "600px", lineHeight: 1.6 }}>
          {t("sss.desc")}
        </p>
      </div>

      {/* İçerik */}
      <div style={{ padding: "50px 200px 100px" }}>
        <div style={{ display: "flex", gap: "60px" }}>
          {/* Sol - Sorular */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {filteredFaqs.map((section) => (
              <div key={section.category} style={{ marginBottom: "48px" }}>
                <h2 style={{ fontSize: "13px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #dc2626" }}>
                  {section.category}
                </h2>
                <div>
                  {section.questions.map((item) => {
                    const id = item.key;
                    const isOpen = openIndex === id;
                    return (
                      <div key={id}>
                        <button
                          onClick={() => toggle(id)}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "20px 0",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "24px",
                          }}
                        >
                          <span style={{ fontSize: "17px", fontWeight: 500, color: isOpen ? "#dc2626" : "#1d1d1f", transition: "color 0.2s", lineHeight: 1.4 }}>
                            {item.q}
                          </span>
                          <span style={{
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "transform 0.3s",
                            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                          }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <line x1="8" y1="2" x2="8" y2="14" stroke={isOpen ? "#dc2626" : "#86868b"} strokeWidth="1.5" />
                              <line x1="2" y1="8" x2="14" y2="8" stroke={isOpen ? "#dc2626" : "#86868b"} strokeWidth="1.5" />
                            </svg>
                          </span>
                        </button>
                        <div style={{
                          maxHeight: isOpen ? "500px" : "0",
                          overflow: "hidden",
                          transition: "max-height 0.4s ease, opacity 0.3s ease",
                          opacity: isOpen ? 1 : 0,
                        }}>
                          <p style={{ fontSize: "16px", color: "#424245", lineHeight: 1.8, paddingBottom: "24px", paddingRight: "52px" }}>
                            {item.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sağ - Kategori Filtre */}
          <div style={{ width: "220px", flexShrink: 0 }}>
            <div className="sticky" style={{ top: "120px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#1d1d1f", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #dc2626" }}>
                {t("sss.kategoriler")}
              </p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <button
                  onClick={() => setActiveCategory(null)}
                  style={{
                    textAlign: "left",
                    padding: "10px 0",
                    fontSize: "14px",
                    fontWeight: !activeCategory ? 600 : 400,
                    color: !activeCategory ? "#dc2626" : "#424245",
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "color 0.15s",
                  }}
                >
                  {t("sss.tumu")}
                </button>
                {faqs.map((section) => (
                  <button
                    key={section.catKey}
                    onClick={() => setActiveCategory(activeCategory === section.catKey ? null : section.catKey)}
                    style={{
                      textAlign: "left",
                      padding: "10px 0",
                      fontSize: "14px",
                      fontWeight: activeCategory === section.catKey ? 600 : 400,
                      color: activeCategory === section.catKey ? "#dc2626" : "#424245",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "color 0.15s",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{section.category}</span>
                    <span style={{ fontSize: "12px", color: activeCategory === section.catKey ? "#dc2626" : "#86868b" }}>{section.questions.length}</span>
                  </button>
                ))}
              </div>

              {/* İletişim CTA */}
              <div style={{ marginTop: "40px", padding: "24px", background: "#f5f5f7" }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1f", marginBottom: "8px" }}>{t("sss.sorunuz")}</p>
                <p style={{ fontSize: "13px", color: "#86868b", lineHeight: 1.5, marginBottom: "16px" }}>{t("sss.sorunuzDesc")}</p>
                <Link
                  href="/iletisim"
                  style={{
                    display: "inline-block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#dc2626",
                    textDecoration: "none",
                  }}
                >
                  {t("sss.iletisim")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

    </div>
  );
}
