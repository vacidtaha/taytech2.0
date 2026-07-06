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

  return applyGeoLocale(req, NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|avif)$).*)",
  ],
};
