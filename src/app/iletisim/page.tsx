"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { FlagTR, FlagGB } from "../components/Flags";
import emailjs from "@emailjs/browser";

// ============================================================
// EmailJS Yapılandırması
// 1. https://www.emailjs.com adresine gidip ücretsiz hesap açın
// 2. Email Services > Add New Service > Gmail veya SMTP ile info@taytech.com.tr bağlayın
// 3. Email Templates > Create New Template ile şablon oluşturun
//    Şablonda şu değişkenleri kullanın:
//    {{from_name}}, {{from_email}}, {{phone}}, {{company}}, {{subject}}, {{message}}
// 4. Aşağıdaki 3 değeri kendi hesabınızdan alın:
// ============================================================
const EMAILJS_SERVICE_ID = "service_taytech";     // Email Services sayfasından
const EMAILJS_TEMPLATE_ID = "template_contact";   // Email Templates sayfasından
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";      // Account > API Keys > Public Key

// Görünen telefon metnini tel: bağlantısına çevirir (ör. "(0262) 502 51 49" -> "tel:+902625025149")
const telHref = (num: string) => {
  const cleaned = num.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return `tel:${cleaned}`;
  return `tel:+90${cleaned.replace(/^0/, "")}`;
};

function ContactHeroTitle({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const isEn = locale === "EN";

  return (
    <h1
      className={`flex flex-nowrap items-center justify-center gap-3 font-semibold text-black md:gap-4 ${
        compact ? "text-[32px]" : "text-5xl md:text-7xl"
      }`}
    >
      {isEn && <span>Contact</span>}
      <Image
        src="/logos/headerlogo1.webp"
        alt=""
        width={1920}
        height={1080}
        className={compact ? "h-20 w-auto" : "h-36 w-auto md:h-48"}
        priority
      />
      {!isEn && <span>İle İletişim</span>}
    </h1>
  );
}

/* lucide-react marka ikonlarını içermediği için LinkedIn ikonu inline SVG */
function LinkedinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/** Kurumsal bilgiler kartındaki tek şirket bloğu (footer'daki ayrımla aynı). */
function CompanyBlock({ country, compact = false }: { country: "tr" | "uk"; compact?: boolean }) {
  const { t, locale } = useLanguage();
  const isEn = locale === "EN";
  const labelStyle = { fontSize: compact ? "15px" : "18px", fontWeight: 500, marginBottom: compact ? "4px" : "6px" } as const;
  const bodyStyle = { fontSize: compact ? "14px" : "17px", fontWeight: 450 } as const;
  const groupStyle = { marginTop: compact ? "16px" : "22px" } as const;
  const linkClass = "hover:text-[#dc2626] transition-colors";
  const linkStyle = { color: "inherit", textDecoration: "none" } as const;

  if (country === "tr") {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <Image src="/logos/taytech-logo.webp" alt="TayTech" width={1856} height={521} className={compact ? "h-6 w-auto" : "h-8 w-auto"} />
          <FlagTR className={compact ? "h-[15px] w-[22px] shrink-0 rounded-[2px] shadow-sm" : "h-[18px] w-[26px] shrink-0 rounded-[3px] shadow-sm"} />
        </div>
        <span aria-hidden style={{ display: "block", height: "1px", width: compact ? "150px" : "176px", background: "rgb(29, 29, 31)", margin: "14px auto 0" }} />
        <p style={{ ...bodyStyle, fontWeight: 500, marginTop: compact ? "16px" : "20px" }}>Taytech Enerji Teknolojileri San. ve Tic. A.Ş.</p>
        <div style={groupStyle}>
          <h3 style={labelStyle}>{t("contact.phoneLabel")}</h3>
          <p style={bodyStyle}><a href={telHref(t("contact.phone1"))} className={linkClass} style={linkStyle}>{t("contact.phone1")}</a></p>
          <p style={bodyStyle}><a href={telHref(t("contact.phone2"))} className={linkClass} style={linkStyle}>{t("contact.phone2")}</a></p>
        </div>
        <div style={groupStyle}>
          <h3 style={labelStyle}>{t("contact.fax")}</h3>
          <p style={bodyStyle}>{t("contact.faxNum")}</p>
        </div>
        <div style={groupStyle}>
          <h3 style={labelStyle}>{t("contact.emailLabel")}</h3>
          <p style={bodyStyle}><a href="mailto:info@taytech.com.tr" className={linkClass} style={linkStyle}>info@taytech.com.tr</a></p>
        </div>
        <div style={groupStyle}>
          <h3 style={labelStyle}>{t("contact.hq")}</h3>
          <p style={bodyStyle}>{t("contact.hqAddr1")}</p>
          <p style={bodyStyle}>{t("contact.hqAddr2")}</p>
        </div>
        <div style={groupStyle}>
          <h3 style={labelStyle}>{t("contact.factory")}</h3>
          <p style={bodyStyle}>{t("contact.factoryAddr1")}</p>
          <p style={bodyStyle}>{t("contact.factoryAddr2")}</p>
          <p style={bodyStyle}>{t("contact.factoryAddr3")}</p>
        </div>
        <a
          href="https://www.linkedin.com/company/taytech-energy-technologies"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Taytech Türkiye LinkedIn"
          className="inline-flex text-[#0A66C2] transition-opacity hover:opacity-80"
          style={{ marginTop: compact ? "18px" : "24px" }}
        >
          <LinkedinIcon size={compact ? 22 : 26} />
        </a>
      </div>
    );
  }

  return (
    <div lang="en">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
        <Image src="/logos/taytech-uk-logo.webp" alt="TayTech UK" width={1886} height={391} className={compact ? "h-5 w-auto" : "h-[26px] w-auto"} />
        <FlagGB className={compact ? "h-[15px] w-[22px] shrink-0 rounded-[2px] shadow-sm" : "h-[18px] w-[26px] shrink-0 rounded-[3px] shadow-sm"} />
      </div>
      <span aria-hidden style={{ display: "block", height: "1px", width: compact ? "150px" : "176px", background: "rgb(29, 29, 31)", margin: "14px auto 0" }} />
      <p style={{ ...bodyStyle, fontWeight: 500, marginTop: compact ? "16px" : "20px" }}>Taytech Technologies Ltd.</p>
      <div style={groupStyle}>
        <h3 style={labelStyle}>{t("contact.emailLabel")}</h3>
        <p style={bodyStyle}><a href="mailto:sales@taytech.com" className={linkClass} style={linkStyle}>sales@taytech.com</a></p>
      </div>
      <div style={groupStyle}>
        <h3 style={labelStyle}>{isEn ? "Address" : "Adres"}</h3>
        <p style={bodyStyle}>17 Green Lanes</p>
        <p style={bodyStyle}>London N16 9BS</p>
        <p style={bodyStyle}>United Kingdom</p>
      </div>
      <a
        href="https://uk.linkedin.com/company/taytech-uk"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Taytech UK LinkedIn"
        className="inline-flex text-[#0A66C2] transition-opacity hover:opacity-80"
        style={{ marginTop: compact ? "18px" : "24px" }}
      >
        <LinkedinIcon size={compact ? 22 : 26} />
      </a>
    </div>
  );
}

export default function IletisimPage() {
  const { t, locale } = useLanguage();
  const isEnPage = locale === "EN";
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: ""
  });
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const subjectOptions = [
    { value: "urun", label: t("contact.subject.urun") },
    { value: "teknik", label: t("contact.subject.teknik") },
    { value: "satis", label: t("contact.subject.satis") },
    { value: "isbirligi", label: t("contact.subject.isbirligi") },
    { value: "diger", label: t("contact.subject.diger") }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("sending");

    try {
      const subjectLabel = subjectOptions.find(o => o.value === formData.subject)?.label || formData.subject;

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          company: formData.company,
          subject: subjectLabel,
          message: formData.message,
        },
        EMAILJS_PUBLIC_KEY
      );

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", company: "", subject: "", message: "" });

      // 5 saniye sonra başarı mesajını kaldır
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  // ===== MOBİL: Responsive iletişim sayfası =====
  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">

        {/* Hero Image with Text - Mobile */}
        <div className="w-full relative">
          <Image
            src="/gradyan1.png"
            alt="Gradient"
            width={768}
            height={300}
            className="w-full h-auto"
            style={{ filter: 'hue-rotate(140deg) saturate(1.2)' }}
            priority
          />

          {/* Hero Title */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '40px' }}>
            <ContactHeroTitle compact />
          </div>
        </div>

        {/* İletişim Formu - Mobile */}
        <div style={{ padding: '0 20px', marginTop: '-30px', marginBottom: '32px' }}>
          {/* Form Üstü Açıklama */}
          <p style={{
            fontSize: '15px',
            fontWeight: 450,
            color: 'rgb(29, 29, 31)',
            lineHeight: '1.5',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {t("contact.intro")}<br />
            {t("contact.intro2")}
          </p>

          <div
            className="bg-[rgb(245,245,247)] rounded-xl border border-[rgb(210,210,215)]"
            style={{ padding: '24px 20px' }}
          >
            <h2 style={{
              fontSize: '20px', fontWeight: 500, textAlign: 'center',
              color: 'rgb(29, 29, 31)', marginBottom: '24px'
            }}>
              {t("contact.formTitle")}
            </h2>

            {/* Başarı Mesajı */}
            {status === "success" && (
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#dcfce7",
                border: "1px solid #86efac",
                borderRadius: "12px",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                <p style={{ color: "#166534", fontSize: "14px", fontWeight: 500 }}>
                  ✓ {t("contact.success")}
                </p>
              </div>
            )}

            {/* Hata Mesajı */}
            {status === "error" && (
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: "12px",
                marginBottom: "20px",
                textAlign: "center"
              }}>
                <p style={{ color: "#991b1b", fontSize: "14px", fontWeight: 500 }}>
                  ✕ {t("contact.error")}
                </p>
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit}>
              {/* Ad Soyad - Mobile (tek sütun) */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.name")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>

              {/* E-posta - Mobile */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.email")} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>

              {/* Telefon - Mobile */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>

              {/* Şirket - Mobile */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.company")}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>

              {/* Konu - Mobile */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.subject")}
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                    style={{
                      width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: 400,
                      color: formData.subject ? 'rgb(29, 29, 31)' : 'rgb(142, 142, 147)',
                      backgroundColor: 'white',
                      border: `1px solid ${isSubjectOpen ? 'rgb(29, 29, 31)' : 'rgb(210, 210, 215)'}`,
                      borderRadius: isSubjectOpen ? '10px 10px 0 0' : '10px',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span>{formData.subject ? subjectOptions.find(o => o.value === formData.subject)?.label : t("contact.subjectPlaceholder")}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      style={{ transform: isSubjectOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                    >
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="rgb(142, 142, 147)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {isSubjectOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0,
                      backgroundColor: 'white', border: '1px solid rgb(29, 29, 31)',
                      borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden', zIndex: 10
                    }}>
                      {subjectOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => { setFormData({...formData, subject: option.value}); setIsSubjectOpen(false); }}
                          style={{
                            padding: '12px 14px', fontSize: '16px', fontWeight: 400, color: 'rgb(29, 29, 31)',
                            cursor: 'pointer',
                            backgroundColor: formData.subject === option.value ? 'rgb(245, 245, 247)' : 'white',
                            transition: 'background-color 0.15s ease'
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mesaj - Mobile */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.message")} *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', resize: 'vertical', transition: 'border-color 0.2s ease',
                    fontFamily: 'inherit', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>

              {/* Gönder - Mobile */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    backgroundColor: status === "sending" ? 'rgb(142, 142, 147)' : 'rgb(29, 29, 31)',
                    color: 'white', fontSize: '16px', fontWeight: 450,
                    padding: '12px 40px', borderRadius: '980px', border: 'none',
                    cursor: status === "sending" ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease',
                    width: '100%', maxWidth: '280px'
                  }}
                >
                  {status === "sending" ? t("contact.sending") : t("contact.send")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CTA - Mobile */}
        <div style={{ padding: '0 20px', marginBottom: '16px' }}>
          <p style={{ fontSize: '20px', fontWeight: 550, color: 'rgb(29, 29, 31)', lineHeight: '1.4' }}>
            {t("contact.cta")}
          </p>
        </div>

        {/* Kurumsal Bilgiler - Mobile */}
        <div style={{ padding: '0 20px', paddingBottom: '32px' }}>
          <div
            className="bg-[rgb(245,245,247)] rounded-xl border border-[rgb(210,210,215)]"
            style={{ padding: '32px 20px' }}
          >
            <h2 style={{
              fontSize: '22px', fontWeight: 500, textAlign: 'center',
              color: 'rgb(29, 29, 31)', marginTop: '16px'
            }}>
              {t("contact.corporate")}
            </h2>

            <div className="text-center" style={{ color: 'rgb(29, 29, 31)', marginTop: '28px' }}>
              {/* İki ayrı şirket bloğu (mobil, alt alta) */}
              {(() => {
                const blocks = isEnPage
                  ? (["uk", "tr"] as const)
                  : (["tr", "uk"] as const);
                return (
                  <>
                    <CompanyBlock country={blocks[0]} compact />
                    <div style={{ borderTop: '1px solid rgb(210, 210, 215)', marginTop: '28px', paddingTop: '28px' }}>
                      <CompanyBlock country={blocks[1]} compact />
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bizi Ziyaret Edin - Mobile */}
        <div style={{ padding: '0 20px', marginTop: '24px', marginBottom: '16px' }}>
          <p style={{ fontSize: '20px', fontWeight: 550, color: 'rgb(29, 29, 31)', textAlign: 'left' }}>
            {t("contact.visit")}
          </p>
          <p style={{ fontSize: '14px', fontWeight: 450, color: 'rgb(110, 110, 115)', marginTop: '6px', textAlign: 'left' }}>
            <span style={{ fontWeight: 550, color: 'rgb(29, 29, 31)' }}>{t("contact.factory")}: </span>
            {t("contact.factoryAddr1")}, {t("contact.factoryAddr2")}, {t("contact.factoryAddr3")}
          </p>
        </div>

        {/* Harita - Mobile */}
        <div style={{ padding: '0 20px', paddingBottom: '40px' }}>
          <div className="bg-[rgb(245,245,247)] rounded-xl border border-[rgb(210,210,215)] overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9278.672215404067!2d29.439337539485077!3d40.83496054140554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cb27467381d25d%3A0xe12ab108d06aa515!2sTaytech%20Enerji%20Teknolojileri%20Sanayi%20ve%20Ticaret%20A.%C5%9E.!5e0!3m2!1str!2str!4v1783198337176!5m2!1str!2str"
              width="100%"
              height="300"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    );
  }

  // ===== MASAÜSTÜ: Orijinal iletişim sayfası (hiç değişmedi) =====
  return (
    <div className="min-h-[200vh] bg-white" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Gradyan Dekor - Sol orta hiza (dağınık efekt) */}
      <div style={{ position: 'absolute', top: '50%', left: '-12%', width: '124%', zIndex: 0, pointerEvents: 'none', transform: 'translateY(-50%) rotate(4deg)', transformOrigin: 'center' }}>
        <Image
          src="/gradyan1.png"
          alt=""
          width={1920}
          height={600}
          style={{
            width: '100%',
            height: 'auto',
            transform: 'scaleY(-1)',
            filter: 'hue-rotate(140deg) saturate(1.2)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          }}
        />
      </div>

      {/* Gradyan Dekor - Sol alt köşe */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '70%', zIndex: 0, pointerEvents: 'none' }}>
        <Image
          src="/gradyan1.png"
          alt=""
          width={1920}
          height={600}
          style={{
            width: '100%',
            height: 'auto',
            transform: 'scaleY(-1)',
            filter: 'hue-rotate(140deg) saturate(1.2)',
            WebkitMaskImage: 'radial-gradient(120% 120% at 0% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)',
            maskImage: 'radial-gradient(120% 120% at 0% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)',
          }}
        />
      </div>

      {/* İçerik (gradyanın üstünde) */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero Image with Text */}
        <div className="w-full relative">
          <Image
            src="/gradyan1.png"
            alt="Gradient"
            width={1920}
            height={600}
          className="w-full h-auto"
          style={{ filter: 'hue-rotate(140deg) saturate(1.2)' }}
          priority
        />

        {/* Hero Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingBottom: '100px' }}>
          <ContactHeroTitle />
        </div>
      </div>

      {/* İletişim Formu */}
      <div
        style={{
          paddingLeft: '300px',
          paddingRight: '300px',
          marginTop: '-80px',
          marginBottom: '50px'
        }}
      >
        {/* Form Üstü Açıklama */}
        <p style={{
          fontSize: '18px',
          fontWeight: 450,
          color: 'rgb(29, 29, 31)',
          lineHeight: '1.5',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          {t("contact.intro")}<br />
          {t("contact.intro2")}
        </p>

        <div
          className="bg-[rgb(245,245,247)] rounded-xl border border-[rgb(210,210,215)]"
          style={{ padding: '50px 70px' }}
        >
          <h2
            className="text-2xl font-medium text-center"
            style={{ color: 'rgb(29, 29, 31)', marginBottom: '40px' }}
          >
            {t("contact.formTitle")}
          </h2>

          {/* Başarı Mesajı */}
          {status === "success" && (
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#dcfce7",
              border: "1px solid #86efac",
              borderRadius: "12px",
              marginBottom: "24px",
              textAlign: "center"
            }}>
              <p style={{ color: "#166534", fontSize: "15px", fontWeight: 500 }}>
                ✓ {t("contact.success")}
              </p>
            </div>
          )}

          {/* Hata Mesajı */}
          {status === "error" && (
            <div style={{
              padding: "16px 24px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: "12px",
              marginBottom: "24px",
              textAlign: "center"
            }}>
              <p style={{ color: "#991b1b", fontSize: "15px", fontWeight: 500 }}>
                ✕ {t("contact.error")}
              </p>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Ad Soyad */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.name")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '15px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>

              {/* E-posta */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.email")} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '15px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Telefon */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.phone")}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '15px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>

              {/* Şirket */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                  {t("contact.company")}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '15px', fontWeight: 400,
                    color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                    border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                    outline: 'none', transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
                />
              </div>
            </div>

            {/* Konu */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                {t("contact.subject")}
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: '15px', fontWeight: 400,
                    color: formData.subject ? 'rgb(29, 29, 31)' : 'rgb(142, 142, 147)',
                    backgroundColor: 'white',
                    border: `1px solid ${isSubjectOpen ? 'rgb(29, 29, 31)' : 'rgb(210, 210, 215)'}`,
                    borderRadius: isSubjectOpen ? '10px 10px 0 0' : '10px',
                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <span>{formData.subject ? subjectOptions.find(o => o.value === formData.subject)?.label : t("contact.subjectPlaceholder")}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                    style={{ transform: isSubjectOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                  >
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="rgb(142, 142, 147)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {isSubjectOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    backgroundColor: 'white', border: '1px solid rgb(29, 29, 31)',
                    borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden', zIndex: 10
                  }}>
                    {subjectOptions.map((option) => (
                      <div
                        key={option.value}
                        onClick={() => { setFormData({...formData, subject: option.value}); setIsSubjectOpen(false); }}
                        style={{
                          padding: '12px 14px', fontSize: '15px', fontWeight: 400, color: 'rgb(29, 29, 31)',
                          cursor: 'pointer',
                          backgroundColor: formData.subject === option.value ? 'rgb(245, 245, 247)' : 'white',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgb(245, 245, 247)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = formData.subject === option.value ? 'rgb(245, 245, 247)' : 'white'}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mesaj */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'rgb(29, 29, 31)', marginBottom: '6px' }}>
                {t("contact.message")} *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={5}
                style={{
                  width: '100%', padding: '12px 14px', fontSize: '15px', fontWeight: 400,
                  color: 'rgb(29, 29, 31)', backgroundColor: 'white',
                  border: '1px solid rgb(210, 210, 215)', borderRadius: '10px',
                  outline: 'none', resize: 'vertical', transition: 'border-color 0.2s ease', fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgb(29, 29, 31)'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(210, 210, 215)'}
              />
            </div>

            {/* Gönder */}
            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  backgroundColor: status === "sending" ? 'rgb(142, 142, 147)' : 'rgb(29, 29, 31)',
                  color: 'white', fontSize: '16px', fontWeight: 450,
                  padding: '12px 40px', borderRadius: '980px', border: 'none',
                  cursor: status === "sending" ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  minWidth: '180px'
                }}
                onMouseOver={(e) => { if (status !== "sending") e.currentTarget.style.backgroundColor = 'rgb(50, 50, 54)'; }}
                onMouseOut={(e) => { if (status !== "sending") e.currentTarget.style.backgroundColor = 'rgb(29, 29, 31)'; }}
              >
                {status === "sending" ? t("contact.sending") : t("contact.send")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* CTA */}
      <div style={{ paddingLeft: '300px', paddingRight: '300px', marginBottom: '20px' }}>
        <p style={{ fontSize: '24px', fontWeight: 550, color: 'rgb(29, 29, 31)', lineHeight: '1.4' }}>
          {t("contact.cta")}
        </p>
      </div>

      {/* Kurumsal Bilgiler */}
      <div style={{ paddingLeft: '300px', paddingRight: '300px', paddingBottom: '40px' }}>
        <div
          className="bg-[rgb(245,245,247)] rounded-xl border border-[rgb(210,210,215)] p-12"
          style={{ minHeight: '800px' }}
        >
          <h2
            className="text-3xl font-medium text-center"
            style={{ color: 'rgb(29, 29, 31)', marginTop: '50px' }}
          >
            {t("contact.corporate")}
          </h2>

          <div className="text-center" style={{ color: 'rgb(29, 29, 31)', marginTop: '50px' }}>
            {/* İki ayrı şirket bloğu (masaüstü, yan yana) */}
            {(() => {
              const blocks = isEnPage
                ? (["uk", "tr"] as const)
                : (["tr", "uk"] as const);
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                  <div style={{ borderRight: '1px solid rgb(210, 210, 215)', paddingRight: '40px' }}>
                    <CompanyBlock country={blocks[0]} />
                  </div>
                  <div style={{ paddingLeft: '40px' }}>
                    <CompanyBlock country={blocks[1]} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bizi Ziyaret Edin */}
      <div style={{ paddingLeft: '300px', paddingRight: '300px', marginTop: '40px', marginBottom: '20px' }}>
        <p style={{ fontSize: '24px', fontWeight: 550, color: 'rgb(29, 29, 31)', textAlign: 'left' }}>
          {t("contact.visit")}
        </p>
        <p style={{ fontSize: '16px', fontWeight: 450, color: 'rgb(110, 110, 115)', marginTop: '8px', textAlign: 'left' }}>
          <span style={{ fontWeight: 550, color: 'rgb(29, 29, 31)' }}>{t("contact.factory")}: </span>
          {t("contact.factoryAddr1")}, {t("contact.factoryAddr2")}, {t("contact.factoryAddr3")}
        </p>
      </div>

      {/* Harita */}
      <div style={{ paddingLeft: '300px', paddingRight: '300px', paddingBottom: '64px' }}>
        <div className="bg-[rgb(245,245,247)] rounded-xl border border-[rgb(210,210,215)] overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9278.672215404067!2d29.439337539485077!3d40.83496054140554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cb27467381d25d%3A0xe12ab108d06aa515!2sTaytech%20Enerji%20Teknolojileri%20Sanayi%20ve%20Ticaret%20A.%C5%9E.!5e0!3m2!1str!2str!4v1783198337176!5m2!1str!2str"
            width="100%"
            height="400"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      </div>

    </div>
  );
}
