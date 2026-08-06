"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useLanguage } from "../context/LanguageContext";
import type { ShowcaseProduct } from "@/lib/catalog";

/* İletişim sayfasındaki formla aynı EmailJS yapılandırması */
const EMAILJS_SERVICE_ID = "service_taytech";
const EMAILJS_TEMPLATE_ID = "template_contact";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

/**
 * Açılır iletişim formundaki bölüme özel metinler.
 * Anahtar: bölümün titleKey'i. name: e-posta konusunda kullanılan kısa ad.
 */
const CONTACT_COPY: Record<
  string,
  { name: { tr: string; en: string }; desc: { tr: string; en: string } }
> = {
  "home.isiistasyonu.title": {
    name: { tr: "Isı İstasyonları", en: "Heat Interface Units" },
    desc: {
      tr: "SmartHexa, HydroHexa, ThermoHexa ve Hydro EM serilerimiz; merkezî sistemli binalarda her daireye kendi ısıtma ve kullanım sıcak suyu kontrolünü verir. Projeniz için doğru seriyi ve modeli birlikte belirleyelim: bilgilerinizi bırakın, mühendis ekibimiz teklif ve önerileriyle en kısa sürede size dönüş yapsın.",
      en: "Our SmartHexa, HydroHexa, ThermoHexa and Hydro EM ranges give every dwelling in a centrally heated building its own heating and hot water control. Leave your details and our engineering team will get back to you shortly with a quote and recommendations for the right series and model for your project.",
    },
  },
  "home.smartserisi.title": {
    name: { tr: "Smart Serisi", en: "Smart Series" },
    desc: {
      tr: "Smart Serisi; hidrofor, derin kuyu, atık su ve parçalayıcılı pompa uygulamaları için akıllı kontrol panoları sunar. Uygulamanıza uygun modeli seçmek, fiyat teklifi almak veya teknik sorularınızı sormak için bilgilerinizi bırakın; ekibimiz en kısa sürede sizinle iletişime geçsin.",
      en: "The Smart Series offers intelligent control panels for booster, deep well, wastewater and grinder pump applications. Leave your details to choose the right model, request a quote or ask a technical question — our team will get back to you shortly.",
    },
  },
  "home.motorkontrol.title": {
    name: { tr: "Motor Kontrol Panoları", en: "Motor Control Panels" },
    desc: {
      tr: "Frekans invertörlü sürücülerden soft starter'lara, elektro-mekanik panolardan NFPA 20 ve EN 12845 uyumlu yangın pompa kontrol panolarına uzanan geniş bir ürün ailesi. Projeniz için doğru çözümü belirlemek, teklif almak veya sorularınızı iletmek için bilgilerinizi bırakın; mühendis ekibimiz en kısa sürede size dönüş yapsın.",
      en: "A broad family of products, from variable-frequency drives and soft starters to electro-mechanical panels and NFPA 20 / EN 12845 compliant fire pump controllers. Leave your details to find the right solution for your project, request a quote or ask a question — our engineering team will get back to you shortly.",
    },
  },
};

/**
 * Ana sayfa ürün vitrini (Isı İstasyonu, Smart Serisi vb.).
 * Video bölümün tamamını arka plan olarak kaplar; videoSide'a göre sağa ya da
 * sola yaslanır, karşı tarafta beyaza yumuşayan bir alan üzerinde
 * başlık/açıklama/buton durur. Altında Apple tarzı, kullanıcı tarafından
 * kaydırılan ürün kartları bulunur.
 */
export default function HomeShowcase({
  videoSrc,
  videoSide = "right",
  titleKey,
  descKey,
  btnKey,
  href,
  products = [],
}: {
  videoSrc: string;
  videoSide?: "left" | "right";
  titleKey: string;
  descKey: string;
  btnKey: string;
  href: string;
  products?: ShowcaseProduct[];
}) {
  const { t, locale, lp } = useLanguage();
  const isEn = locale === "EN";
  const videoLeft = videoSide === "left";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // Açılır-kapanır iletişim formu
  const copy = CONTACT_COPY[titleKey];
  const formRef = useRef<HTMLDivElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  function toggleForm() {
    setFormOpen((open) => {
      const next = !open;
      if (next) {
        // Panel açılırken görünür alana kaydır
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 250);
      }
      return next;
    });
  }

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !message.trim() || status === "sending") return;
    setStatus("sending");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name || email,
          from_email: email,
          phone: "",
          company: "",
          subject: isEn
            ? `Homepage contact: ${copy?.name.en ?? t(titleKey)}`
            : `Ana sayfa iletişim: ${copy?.name.tr ?? t(titleKey)}`,
          message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setTimeout(() => setStatus("idle"), 6000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 6000);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#d2d2d7] bg-white px-4 py-3 text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] outline-none transition-colors focus:border-[#dc2626]";

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  function scrollByDir(dir: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.75), behavior: "smooth" });
  }

  return (
    <div
      className="relative overflow-hidden bg-white mx-[8px] lg:mx-[13px]"
      style={{ marginTop: "13px" }}
    >
      {/* Üst blok: video + metin (mobilde alt alta, geniş ekranda video arka plan) */}
      <div className="relative flex flex-col lg:block">
        {/* Video: mobilde gizli, lg'de bölümün arka planı */}
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={t(titleKey)}
          className={`hidden lg:absolute lg:inset-0 lg:block lg:h-full lg:w-full lg:object-contain ${
            videoLeft ? "lg:object-left" : "lg:object-right"
          }`}
        />

        {/* Videonun karşısından beyaza yumuşayan katman — yalnızca geniş ekranda */}
        <div
          aria-hidden
          className="absolute inset-0 hidden lg:block"
          style={{
            background: `linear-gradient(to ${videoLeft ? "left" : "right"}, #ffffff 0%, #ffffff 22%, rgba(255,255,255,0.88) 38%, rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 72%)`,
          }}
        />

        {/* İçerik — mobilde videonun üstünde (akışta ilk), lg'de videonun karşı tarafında */}
        <div
          className={`relative z-10 order-first flex items-center px-7 pb-8 pt-10 lg:min-h-[760px] lg:px-7 lg:py-8 ${
            videoLeft ? "lg:justify-end" : ""
          }`}
        >
          <div
            className={`w-full max-w-[520px] ${
              videoLeft ? "lg:!mr-[100px]" : "lg:!ml-[100px]"
            }`}
          >
            <h2
              className="mb-4 text-[26px] font-bold leading-tight lg:text-[48px]"
              style={{ color: "#1d1d1f" }}
            >
              {t(titleKey)}
            </h2>
            <p
              className="mb-8 text-[14px] leading-relaxed lg:text-[18px]"
              style={{ color: "#4b4b4f", fontWeight: 450 }}
            >
              {t(descKey)}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={lp(href)}
                className="inline-flex items-center gap-[10px] whitespace-nowrap rounded-full bg-[#dc2626] px-[22px] py-[12px] text-[15px] font-semibold text-white transition-all hover:bg-[#b91c1c] lg:text-[17px]"
              >
                {t(btnKey)}
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
              <button
                type="button"
                onClick={toggleForm}
                aria-expanded={formOpen}
                className={`inline-flex items-center gap-[8px] whitespace-nowrap rounded-full px-[22px] py-[12px] text-[15px] font-semibold text-white transition-all lg:text-[17px] ${
                  formOpen
                    ? "bg-[#991b1b]"
                    : "bg-[#b91c1c] hover:bg-[#991b1b]"
                }`}
              >
                {isEn ? "Contact Us" : "İletişime Geç"}
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform duration-300 ${
                    formOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Açılır-kapanır iletişim formu — tasarımı bozmadan bölümün altında açılır */}
      <div
        ref={formRef}
        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
          formOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`border-t border-[#f0f0f0] bg-[#fafafa] px-7 py-9 lg:flex lg:items-center lg:gap-16 lg:px-[100px] lg:py-11 ${
              videoLeft ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className="mx-auto w-full max-w-[680px] lg:mx-0">
              <h3 className="text-[19px] font-semibold text-[#1d1d1f] lg:text-[24px]">
                {isEn
                  ? "Request a quote, ask a question"
                  : "Teklif alın, sorularınızı sorun"}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6e6e73] lg:text-[15px]">
                {copy
                  ? isEn
                    ? copy.desc.en
                    : copy.desc.tr
                  : isEn
                    ? "Leave your details and our engineering team will get back to you shortly."
                    : "Bilgilerinizi bırakın, mühendis ekibimiz en kısa sürede size dönüş yapsın."}
              </p>
              {status === "success" ? (
                <p className="mt-6 rounded-xl bg-[#e8f5e9] px-4 py-3.5 text-[14px] font-medium text-[#1b5e20]">
                  {isEn
                    ? "Your message has been sent. We will get back to you as soon as possible."
                    : "Mesajınız gönderildi. En kısa sürede size dönüş yapacağız."}
                </p>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-6 flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isEn ? "Full name" : "Ad Soyad"}
                      autoComplete="name"
                      className={inputClass}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isEn ? "Email address" : "E-posta adresi"}
                      autoComplete="email"
                      required
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      isEn
                        ? "Which product are you interested in? Share your question or project details..."
                        : "Hangi ürünle ilgileniyorsunuz? Sorunuzu veya proje detaylarınızı yazın..."
                    }
                    rows={4}
                    required
                    className={`${inputClass} resize-none`}
                  />
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="inline-flex items-center gap-2 rounded-full bg-[#dc2626] px-7 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#b91c1c] disabled:opacity-60 lg:text-[15px]"
                    >
                      {status === "sending"
                        ? isEn
                          ? "Sending..."
                          : "Gönderiliyor..."
                        : isEn
                          ? "Send"
                          : "Gönder"}
                    </button>
                    {status === "error" && (
                      <p className="text-[13px] font-medium text-[#dc2626]">
                        {isEn
                          ? "Message could not be sent. Please try again."
                          : "Mesaj gönderilemedi. Lütfen tekrar deneyin."}
                      </p>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Boş kalan tarafta: iletişim sayfasındaki logo + başlık */}
            <div
              className={`hidden lg:flex lg:min-w-0 lg:flex-1 lg:items-center ${
                videoLeft ? "lg:justify-center" : "lg:justify-end lg:pr-28"
              }`}
            >
              <div className="flex flex-nowrap items-center gap-4 whitespace-nowrap text-[44px] font-semibold text-black">
                {isEn && <span>Contact</span>}
                <Image
                  src="/logos/headerlogo1.webp"
                  alt=""
                  width={1920}
                  height={1080}
                  className="h-40 w-auto"
                />
                {!isEn && <span>İle İletişim</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt blok: ilgili ürünler — Apple tarzı kaydırılabilir kartlar */}
      {products.length > 0 && (
        <div className="relative border-t border-[#f0f0f0] pb-6 pt-7 lg:pb-8 lg:pt-9">
          <div
            ref={scrollRef}
            onScroll={updateArrows}
            className="no-scrollbar flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-smooth px-[44px] scroll-pl-[44px] lg:gap-5 lg:px-[140px] lg:scroll-pl-[140px]"
          >
            {products.map((p) => {
              const img = isEn ? p.imageEn ?? p.imageTr : p.imageTr ?? p.imageEn;
              const name = isEn ? p.nameEn : p.nameTr;
              const excerpt = isEn
                ? p.excerptEn ?? p.excerptTr
                : p.excerptTr ?? p.excerptEn;
              return (
                <Link
                  key={p.slug}
                  href={lp(`/urun/${p.slug}`)}
                  className="group flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-[#f5f5f7] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.10)] lg:w-[290px]"
                >
                  {/* Görsel alanı */}
                  <div className="relative mx-6 mt-7 h-[150px] overflow-hidden lg:h-[180px]">
                    {img ? (
                      <Image
                        src={img}
                        alt={name}
                        fill
                        sizes="290px"
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl font-semibold text-[#d2d2d7]">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Metin alanı */}
                  <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                    <h3 className="text-[17px] font-semibold leading-snug text-[#1d1d1f]">
                      {name}
                    </h3>
                    {excerpt && (
                      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#6e6e73]">
                        {excerpt}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[14px] font-medium text-[#dc2626]">
                      {isEn ? "Explore" : "İncele"}
                      <ChevronRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Ok butonları (Apple tarzı) */}
          <div className="mt-5 flex justify-end gap-3 px-[44px] lg:px-[140px]">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              disabled={!canLeft}
              aria-label={isEn ? "Scroll left" : "Sola kaydır"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-all hover:bg-[#dcdce1] disabled:opacity-35"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              disabled={!canRight}
              aria-label={isEn ? "Scroll right" : "Sağa kaydır"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8e8ed] text-[#1d1d1f] transition-all hover:bg-[#dcdce1] disabled:opacity-35"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
