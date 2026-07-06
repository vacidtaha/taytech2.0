import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { JWTPayload } from "jose";
import { SESSION_COOKIE, verifySessionToken } from "./auth";

/**
 * Geçerli oturumu döndürür (yoksa null).
 * Server Component'lerde ve Route Handler / Server Action içinde kullanılabilir.
 */
export async function getSession(): Promise<JWTPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Oturum yoksa fırlatan yardımcı — Server Component'lerde kullanışlı.
 */
export async function requireSession(): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Route Handler'lar için: oturum yoksa 401 Response, varsa payload döndürür.
 *
 * Kullanım:
 *   const gate = await requireApiSession();
 *   if (gate instanceof NextResponse) return gate;
 *   // gate = oturum payload'ı
 *
 * Proxy yalnızca sayfa gezinmesini korur; admin verisi işleyen HER API rotası
 * bu kontrolü kendi içinde çağırmalıdır.
 */
export async function requireApiSession(): Promise<JWTPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
  }
  return session;
}
