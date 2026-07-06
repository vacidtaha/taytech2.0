"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ChevronRight, ChevronLeft, Phone, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { resolveHref, type MenuItem } from "../lib/menu";
import { useLanguage } from "../context/LanguageContext";

type Panel = {
  key: string;
  title: string | null;
  items: MenuItem[];
  parentHref: string;
};

export default function Header({ menu }: { menu: MenuItem[] }) {
  const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
  const [path, setPath] = useState<MenuItem[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const { locale, setLocale } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Ana sayfa girişinde (en üstte) header şeffaf-vinyet olur; kaydırınca normal beyaz.
  const homeTop = isHome && !scrolled;

  // Scroll-video bölümü ekranı kapladığında header gizlenir, çıkınca geri gelir.
  useEffect(() => {
    const onEvt = (e: Event) => setHidden((e as CustomEvent<boolean>).detail);
    window.addEventListener("taytech:scrollvideo", onEvt as EventListener);
    return () =>
      window.removeEventListener("taytech:scrollvideo", onEvt as EventListener);
  }, []);

  useEffect(() => {
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    const evaluate = () => {
      const y = window.scrollY;
      // Histerezis: kapanma 140px, açılma 40px. Aradaki ölü bölge,
      // header kısalınca oluşan layout kaymasının eşiği geçip
      // aç/kapa döngüsü (titreme) oluşturmasını engeller.
      setScrolled((prev) => {
        if (!prev && y > 140) return true;
        if (prev && y < 40) return false;
        return prev;
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(evaluate);
    };
    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isOpen = phase !== "closed";
  const closing = phase === "closing";

  const label = (item: MenuItem) =>
    locale === "EN" ? item.en ?? item.label : item.label;

  const openMenu = () => {
    setPath([]);
    setPhase("open");
  };

  const openAt = (item: MenuItem) => {
    setPath(item.children?.length ? [item] : []);
    setPhase("open");
  };

  const closeMenu = () => {
    setPhase("closing");
    window.setTimeout(() => {
      setPhase("closed");
      setPath([]);
    }, 210);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  }, [path.length]);

  const handleBranch = (item: MenuItem, level: number) => {
    setPath((prev) => [...prev.slice(0, level), item]);
  };

  const goBack = () => {
    setPath((prev) => prev.slice(0, -1));
  };

  const panels: Panel[] = [
    { key: "root", title: null, items: menu, parentHref: "" },
  ];
  let parentHref = "";
  for (const item of path) {
    const hrefOfItem = resolveHref(item, parentHref);
    if (item.children) {
      panels.push({
        key: hrefOfItem,
        title: label(item),
        items: item.children,
        parentHref: hrefOfItem,
      });
    }
    parentHref = hrefOfItem;
  }

  const topLinks = menu;

  // Yönetim paneli / giriş sayfalarında site header'ı gizlenir.
  if (pathname.startsWith("/giris") || pathname.startsWith("/yonetim")) {
    return null;
  }

  return (
    <header
      className={`top-0 z-40 w-full transition-[opacity,background-color,border-color] duration-500 ease-in-out ${
        isHome ? "sticky md:fixed" : "sticky"
      } ${homeTop ? "" : "border-b border-zinc-200 bg-white"} ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {homeTop && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10"
          style={{
            height: "175%",
            backgroundImage:
              "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.97) 22%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.6) 58%, rgba(255,255,255,0.32) 76%, rgba(255,255,255,0.12) 90%, rgba(255,255,255,0) 100%)",
          }}
        />
      )}
      <div className="px-5 md:pl-20 md:pr-6">
        {/* ÜST SATIR - aşağı kaydırınca yukarı kayıp kaybolur */}
        <div
          className={`relative overflow-hidden transition-all duration-300 ease-out ${
            scrolled ? "max-h-0 opacity-0" : "max-h-40 pt-4 opacity-100"
          }`}
        >
          <div className="absolute right-0 top-4 flex items-center gap-2 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setLocale("TR")}
              className={`transition-colors ${
                locale === "TR"
                  ? "text-red-600"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              TR
            </button>
            <span className="text-zinc-300">/</span>
            <button
              type="button"
              onClick={() => setLocale("EN")}
              className={`transition-colors ${
                locale === "EN"
                  ? "text-red-600"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              ENG
            </button>
          </div>
          <Link href="/" className="flex items-center gap-3 md:gap-5">
            <Image
              src="/logos/headerlogo1.webp"
              alt="TayTech Logo 1"
              width={1920}
              height={1080}
              priority
              className="h-12 w-auto md:h-20"
            />
            <Image
              src="/logos/headerlogo2.webp"
              alt="TayTech Logo 2"
              width={1920}
              height={1080}
              priority
              className="h-12 w-auto md:h-20"
            />
          </Link>
        </div>

        {/* ALT SATIR - her zaman görünür */}
        <nav className="flex items-center py-3">
          <button
            type="button"
            aria-label="Menüyü aç"
            onClick={openMenu}
            className="group mr-4 flex h-10 w-10 flex-col items-start justify-center gap-[5px] md:mr-8"
          >
            <span className="h-[3px] w-5 rounded-full bg-zinc-800 transition-all duration-300 ease-out translate-x-0 group-hover:translate-x-2 group-hover:bg-red-600" />
            <span className="h-[3px] w-3 rounded-full bg-zinc-800 transition-all duration-300 ease-out translate-x-0 group-hover:translate-x-4 group-hover:bg-red-600" />
            <span className="h-[3px] w-7 rounded-full bg-zinc-800 transition-all duration-300 ease-out translate-x-0 group-hover:translate-x-0 group-hover:bg-red-600" />
          </button>

          {/* Daralınca hamburger ile bağlantıların arasında beliren logolar */}
          <Link
            href="/"
            aria-hidden={!scrolled}
            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-out md:gap-3 ${
              scrolled
                ? "mr-4 max-w-[230px] opacity-100 md:mr-8 md:max-w-[360px]"
                : "mr-0 max-w-0 opacity-0"
            }`}
          >
            <Image
              src="/logos/headerlogo1.webp"
              alt="TayTech Logo 1"
              width={1920}
              height={1080}
              className="h-10 w-auto shrink-0 md:h-16"
            />
            <Image
              src="/logos/headerlogo2.webp"
              alt="TayTech Logo 2"
              width={1920}
              height={1080}
              className="h-10 w-auto shrink-0 md:h-16"
            />
          </Link>

          <ul className="hidden items-center gap-8 text-lg font-medium text-zinc-800 md:flex">
            <li>
              <Link href="/" className="transition-colors hover:text-red-600">
                {locale === "EN" ? "Home" : "Ana Sayfa"}
              </Link>
            </li>
            {topLinks.map((link) =>
              link.children?.length ? (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => openAt(link)}
                    className="transition-colors hover:text-red-600"
                  >
                    {label(link)}
                  </button>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href ?? "#"}
                    className="transition-colors hover:text-red-600"
                  >
                    {label(link)}
                  </Link>
                </li>
              )
            )}
          </ul>

          {/* Daralınca sağ uçta beliren dil seçici */}
          <div
            className={`ml-auto flex items-center gap-2 text-sm font-semibold transition-opacity duration-300 ${
              scrolled ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={() => setLocale("TR")}
              className={`transition-colors ${
                locale === "TR"
                  ? "text-red-600"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              TR
            </button>
            <span className="text-zinc-300">/</span>
            <button
              type="button"
              onClick={() => setLocale("EN")}
              className={`transition-colors ${
                locale === "EN"
                  ? "text-red-600"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              ENG
            </button>
          </div>
        </nav>
      </div>

      {isOpen && isMobile && (() => {
        const current = panels[panels.length - 1];
        const level = panels.length - 1;
        const activeItem = path[level];
        return (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) closeMenu();
            }}
            className="fixed inset-0 z-50 bg-black/25"
          >
            <div
              className={`menu-slide-in relative flex h-full w-[88vw] max-w-[380px] flex-col bg-red-700 transition-transform duration-200 ease-in ${
                closing ? "-translate-x-full" : "translate-x-0"
              }`}
            >
              {/* Üst bar: geri + kapat */}
              <div className="flex h-[64px] shrink-0 items-center justify-between px-3 pt-3">
                {level > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-0.5 rounded-lg px-2 py-2 text-base font-medium text-white transition-opacity hover:opacity-70"
                  >
                    <ChevronLeft size={24} />
                    {locale === "EN" ? "Back" : "Geri"}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  aria-label="Menüyü kapat"
                  onClick={closeMenu}
                  className="flex h-10 w-10 items-center justify-center text-white transition-opacity hover:opacity-70"
                >
                  <X size={26} />
                </button>
              </div>
              {/* İçerik: seviye değişince yerinde fade-in olur */}
              <nav
                key={current.key}
                className="menu-panel-fade no-scrollbar flex-1 overflow-y-auto px-3 pb-6 pt-1"
              >
                {level >= 1 && current.title && (
                  <div className="mb-1 px-4 py-2.5">
                    <span className="text-lg font-medium text-white/60">
                      {current.title}
                    </span>
                  </div>
                )}
                <ul className="flex flex-col gap-1">
                  {current.items.map((item) => {
                    const active = activeItem === item;
                    const hasChildren = !!item.children?.length;
                    const baseClass =
                      "flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3.5 text-lg font-medium text-white text-left transition-colors";
                    const content = (
                      <>
                        <span>{label(item)}</span>
                        {hasChildren && (
                          <ChevronRight size={20} className="shrink-0 opacity-80" />
                        )}
                      </>
                    );
                    if (hasChildren) {
                      return (
                        <li key={item.label}>
                          <button
                            type="button"
                            onClick={() => handleBranch(item, level)}
                            className={`${baseClass} ${
                              active ? "bg-red-800" : "hover:bg-red-800"
                            }`}
                          >
                            {content}
                          </button>
                        </li>
                      );
                    }
                    if (item.disabled) {
                      return (
                        <li key={item.label}>
                          <span className={`${baseClass} cursor-default hover:bg-red-800`}>
                            {content}
                          </span>
                        </li>
                      );
                    }
                    return (
                      <li key={item.label}>
                        <Link
                          href={resolveHref(item, current.parentHref)}
                          onClick={closeMenu}
                          className={`${baseClass} hover:bg-red-800`}
                        >
                          {content}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              {level === 0 && (
                <div className="shrink-0 px-7 pb-8 text-white">
                  <button
                    type="button"
                    onClick={() => setLocale(locale === "TR" ? "EN" : "TR")}
                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-2 text-base font-medium text-white transition-colors hover:bg-white/10"
                  >
                    {locale === "TR" ? "Türkiye" : "Unıted Kıngdom"}
                  </button>
                  <a
                    href="tel:+902625025149"
                    className="flex items-center gap-3 text-base font-medium transition-opacity hover:opacity-80"
                  >
                    <Phone size={18} className="shrink-0" />
                    <span>+90 (262) 502 51 49</span>
                  </a>
                  <a
                    href="mailto:info@taytech.com.tr"
                    className="mt-3 flex items-center gap-3 text-base font-medium transition-opacity hover:opacity-80"
                  >
                    <Mail size={18} className="shrink-0" />
                    <span>info@taytech.com.tr</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {isOpen && !isMobile && (
        <div
          ref={scrollRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMenu();
          }}
          className="no-scrollbar fixed inset-0 z-50 flex overflow-x-auto"
        >
          <div
            className={`flex h-full min-w-max transition-transform duration-200 ease-in ${
              closing ? "-translate-x-[100vw]" : "translate-x-0"
            }`}
          >
            {panels.map((panel, level) => {
              const activeItem = path[level];
              return (
                <div
                  key={panel.key}
                  style={{
                    zIndex: 50 - level,
                    width: `min(${Math.max(220, 380 - level * 30)}px, 86vw)`,
                  }}
                  className="relative flex h-full flex-none flex-col"
                >
                  <div className="panel-bg-anim absolute inset-0 bg-red-700 before:absolute before:right-full before:top-0 before:h-full before:w-40 before:bg-red-700 before:content-['']" />
                  <div className="panel-content-anim relative flex h-full flex-col">
                    <div className="flex h-[76px] shrink-0 items-start justify-end px-5 pt-6">
                      {level === 0 && (
                        <button
                          type="button"
                          aria-label="Menüyü kapat"
                          onClick={closeMenu}
                          className="flex h-10 w-10 items-center justify-center text-white transition-opacity hover:opacity-70"
                        >
                          <X size={28} />
                        </button>
                      )}
                    </div>
                    <nav className="no-scrollbar flex-1 overflow-y-auto px-4 pb-8 pt-3">
                      {level >= 1 && panel.title && (
                        <div className="mb-1 px-5 py-3.5">
                          <span className="text-xl font-medium text-white/60">
                            {panel.title}
                          </span>
                        </div>
                      )}
                      <ul className="flex flex-col gap-1">
                        {panel.items.map((item) => {
                          const active = activeItem === item;
                          const hasChildren = !!item.children?.length;
                          const sizeClass =
                            level === 0 ? "text-xl py-3.5" : "text-lg py-3";
                          // Ürün dallarında (3. panel ve sonrası) öğenin altında
                          // önizleme fotoğrafı gösterilir.
                          const showImage = level >= 2 && !!item.image;
                          const baseClass = showImage
                            ? `block w-full rounded-lg px-5 font-medium text-white text-left transition-colors ${sizeClass}`
                            : `flex w-full items-center justify-between gap-3 rounded-lg px-5 font-medium text-white text-left transition-colors ${sizeClass}`;
                          const content = (
                            <>
                              {showImage ? (
                                <span className="flex w-full items-center justify-between gap-3">
                                  <span>{label(item)}</span>
                                  {hasChildren && (
                                    <ChevronRight
                                      size={20}
                                      className="shrink-0 opacity-80"
                                    />
                                  )}
                                </span>
                              ) : (
                                <span>{label(item)}</span>
                              )}
                              {!showImage && hasChildren && (
                                <ChevronRight
                                  size={20}
                                  className="shrink-0 opacity-80"
                                />
                              )}
                              {showImage && item.image && (
                                <span className="mt-2.5 block w-full overflow-hidden rounded-lg bg-white">
                                  <Image
                                    src={item.image}
                                    alt=""
                                    width={320}
                                    height={128}
                                    className="h-24 w-full object-contain p-2"
                                  />
                                </span>
                              )}
                            </>
                          );
                          if (hasChildren) {
                            // İlk panelde tıklayınca alt panel açılır; sonraki
                            // panellerde üzerine gelince alt panel açılır,
                            // tıklayınca kategorinin kendi sayfasına gidilir.
                            if (level === 0) {
                              return (
                                <li key={item.label}>
                                  <button
                                    type="button"
                                    onClick={() => handleBranch(item, level)}
                                    className={`${baseClass} ${
                                      active ? "bg-red-800" : "hover:bg-red-800"
                                    }`}
                                  >
                                    {content}
                                  </button>
                                </li>
                              );
                            }
                            if (item.disabled) {
                              // Boş kategori: üzerine gelince alt panel açılır
                              // ama tıklanınca hiçbir sayfaya gitmez.
                              return (
                                <li key={item.label}>
                                  <button
                                    type="button"
                                    onMouseEnter={() => handleBranch(item, level)}
                                    onClick={() => handleBranch(item, level)}
                                    className={`${baseClass} cursor-default ${
                                      active ? "bg-red-800" : "hover:bg-red-800"
                                    }`}
                                  >
                                    {content}
                                  </button>
                                </li>
                              );
                            }
                            return (
                              <li key={item.label}>
                                <Link
                                  href={resolveHref(item, panel.parentHref)}
                                  onClick={closeMenu}
                                  onMouseEnter={() => handleBranch(item, level)}
                                  className={`${baseClass} ${
                                    active ? "bg-red-800" : "hover:bg-red-800"
                                  }`}
                                >
                                  {content}
                                </Link>
                              </li>
                            );
                          }
                          if (item.disabled) {
                            return (
                              <li key={item.label}>
                                <span
                                  onMouseEnter={
                                    level >= 1
                                      ? () => setPath((prev) => prev.slice(0, level))
                                      : undefined
                                  }
                                  className={`${baseClass} cursor-default hover:bg-red-800`}
                                >
                                  {content}
                                </span>
                              </li>
                            );
                          }
                          return (
                            <li key={item.label}>
                              <Link
                                href={resolveHref(item, panel.parentHref)}
                                onClick={closeMenu}
                                onMouseEnter={
                                  level >= 1
                                    ? () => setPath((prev) => prev.slice(0, level))
                                    : undefined
                                }
                                className={`${baseClass} hover:bg-red-800`}
                              >
                                {content}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                    {level === 0 && (
                      <div className="shrink-0 px-9 pb-10 text-white md:pb-32">
                        <button
                          type="button"
                          onClick={() => setLocale(locale === "TR" ? "EN" : "TR")}
                          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 px-5 py-2 text-base font-medium text-white transition-colors hover:bg-white/10"
                        >
                          {locale === "TR" ? "Türkiye" : "Unıted Kıngdom"}
                        </button>
                        <a
                          href="tel:+902625025149"
                          className="flex items-center gap-3 text-base font-medium transition-opacity hover:opacity-80"
                        >
                          <Phone size={18} className="shrink-0" />
                          <span>+90 (262) 502 51 49</span>
                        </a>
                        <a
                          href="mailto:info@taytech.com.tr"
                          className="mt-3 flex items-center gap-3 text-base font-medium transition-opacity hover:opacity-80"
                        >
                          <Mail size={18} className="shrink-0" />
                          <span>info@taytech.com.tr</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
