import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { verifyCredentials } from "@/lib/credentials";
import { checkLock, recordFailure, recordSuccess } from "@/lib/rate-limit";

// node:crypto (scrypt) kullandığımız için Node.js runtime şart.
export const runtime = "nodejs";

function clientKey(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : req.headers.get("x-real-ip") ?? "unknown";
  return `login:${ip}`;
}

export async function POST(req: NextRequest) {
  const key = clientKey(req);

  // Kilitli mi?
  const lock = checkLock(key);
  if (lock.blocked) {
    return NextResponse.json(
      { ok: false, error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
      { status: 429, headers: { "Retry-After": String(lock.retryAfterSec) } }
    );
  }

  const body = await req.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const valid = await verifyCredentials(username, password);

  if (!valid) {
    const res = recordFailure(key);
    const status = res.blocked ? 429 : 401;
    const error = res.blocked
      ? "Çok fazla deneme. Lütfen daha sonra tekrar deneyin."
      : "Kullanıcı adı veya şifre hatalı.";
    return NextResponse.json(
      { ok: false, error },
      res.blocked
        ? { status, headers: { "Retry-After": String(res.retryAfterSec) } }
        : { status }
    );
  }

  recordSuccess(key);

  const token = await createSessionToken(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
