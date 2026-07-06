"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ProductContactDock from "./ProductContactDock";

/** İletişim sayfası hariç tüm sayfalarda sabit iletişim kutusu. */
export default function SiteContactDock() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [pastHero, setPastHero] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setPastHero(true);
      return;
    }

    setPastHero(false);

    const hero = document.getElementById("home-hero");
    if (!hero) {
      setPastHero(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hero tamamen ekrandan çıkınca kutuyu göster.
        setPastHero(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  if (pathname === "/iletisim" || pathname.startsWith("/iletisim/")) {
    return null;
  }

  const productSlug = pathname.match(/^\/urun\/([^/]+)/)?.[1];

  return (
    <ProductContactDock
      productSlug={productSlug}
      visible={pastHero}
    />
  );
}
