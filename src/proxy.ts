import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  detectLocaleFromRequest,
  localeCookieOptions,
  parseLocale,
} from "@/lib/locale";
import { enToTr, isEnPath } from "@/lib/paths";

export const LOCALE_HEADER = "x-taytech-locale";

function applyGeoLocale(req: NextRequest, res: NextResponse) {
  const saved = parseLocale(req.cookies.get(LOCALE_COOKIE)?.value);
  const manual = req.cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";
  if (saved || manual) return res;

  res.cookies.set(
    LOCALE_COOKIE,
    detectLocaleFromRequest(req),
    localeCookieOptions()
  );
  return res;
}

function isBot(req: NextRequest): boolean {
  const ua = req.headers.get("user-agent")?.toLowerCase() ?? "";
  return /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit/.test(
    ua
  );
}

/** İsteğe dil başlığı ekleyerek devam eder / rewrite eder. */
function withLocale(
  req: NextRequest,
  locale: "TR" | "EN",
  rewriteTo?: string
): NextResponse {
  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, locale);
  if (rewriteTo !== undefined) {
    const url = req.nextUrl.clone();
    url.pathname = rewriteTo;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/yonetim") && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/giris";
    return applyGeoLocale(req, NextResponse.redirect(url));
  }

  if (pathname === "/giris" && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/yonetim";
    return applyGeoLocale(req, NextResponse.redirect(url));
  }

  // İngilizce URL'ler: /en/products → /urunler rewrite'ı + EN dil başlığı.
  if (isEnPath(pathname)) {
    return applyGeoLocale(req, withLocale(req, "EN", enToTr(pathname)));
  }

  // Coğrafi yönlendirme: yalnızca ana sayfada, ilk ziyarette ve bot değilse.
  // Derin Türkçe URL'ler asla otomatik yönlendirilmez (SEO için kritik).
  if (pathname === "/" && !isBot(req)) {
    const saved = parseLocale(req.cookies.get(LOCALE_COOKIE)?.value);
    const manual = req.cookies.get(LOCALE_MANUAL_COOKIE)?.value === "1";
    const preferred = manual ? saved : saved ?? detectLocaleFromRequest(req);
    if (preferred === "EN") {
      const url = req.nextUrl.clone();
      url.pathname = "/en";
      const res = NextResponse.redirect(url);
      if (!saved && !manual) {
        res.cookies.set(LOCALE_COOKIE, "EN", localeCookieOptions());
      }
      return res;
    }
  }

  return applyGeoLocale(req, withLocale(req, "TR"));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|avif)$).*)",
  ],
};
