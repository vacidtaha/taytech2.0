/**
 * Basit, sunucu-içi (in-memory) brute-force koruması.
 *
 * NOT: Tek Node.js süreci için tasarlanmıştır. Yeniden başlatmada sıfırlanır ve
 * çok örnekli/serverless dağıtımda örnekler arası paylaşılmaz. Böyle bir ortamda
 * Redis/Upstash gibi paylaşımlı bir depo kullanılmalıdır.
 */

type Entry = {
  fails: number;
  first: number; // pencerenin başladığı zaman
  lockedUntil: number; // 0 = kilitli değil
};

const WINDOW_MS = 15 * 60 * 1000; // 15 dk
const MAX_FAILS = 5; // pencere içinde bu kadar başarısızlıkta kilit
const LOCK_MS = 15 * 60 * 1000; // 15 dk kilit

const store = new Map<string, Entry>();

// Bellek şişmesini önlemek için ara sıra temizlik.
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [key, e] of store) {
    if (e.lockedUntil < now && now - e.first > WINDOW_MS) {
      store.delete(key);
    }
  }
}

export type RateResult = { blocked: boolean; retryAfterSec: number };

export function checkLock(key: string): RateResult {
  const now = Date.now();
  const e = store.get(key);
  if (e && e.lockedUntil > now) {
    return { blocked: true, retryAfterSec: Math.ceil((e.lockedUntil - now) / 1000) };
  }
  return { blocked: false, retryAfterSec: 0 };
}

export function recordFailure(key: string): RateResult {
  const now = Date.now();
  sweep(now);
  let e = store.get(key);

  if (!e || now - e.first > WINDOW_MS) {
    e = { fails: 0, first: now, lockedUntil: 0 };
  }

  e.fails += 1;
  if (e.fails >= MAX_FAILS) {
    e.lockedUntil = now + LOCK_MS;
    e.fails = 0;
    e.first = now;
  }
  store.set(key, e);

  if (e.lockedUntil > now) {
    return { blocked: true, retryAfterSec: Math.ceil((e.lockedUntil - now) / 1000) };
  }
  return { blocked: false, retryAfterSec: 0 };
}

export function recordSuccess(key: string): void {
  store.delete(key);
}
