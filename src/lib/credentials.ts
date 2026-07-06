import { scrypt as scryptCb, timingSafeEqual, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEYLEN = 64;

/**
 * scrypt hash üretir (`salt:hash` hex formatında).
 * .env.local için ADMIN_PASSWORD_HASH değeri üretmekte kullanılır.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, KEYLEN);
  return `${salt}:${derived.toString("hex")}`;
}

/** İki string'i sabit-zamanlı karşılaştırır (uzunluk sızıntısını da önler). */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual eşit uzunluk ister; farklıysa yine de zaman-sabit davranmak için
  // her iki tarafı sabit boya hash'le.
  if (bufA.length !== bufB.length) {
    // Uzunluk farkını sızdırmamak için bir kıyaslama daha yap ve false dön.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;
    let derived: Buffer;
    try {
      derived = await scrypt(password, salt, KEYLEN);
    } catch {
      return false;
    }
    const expected = Buffer.from(key, "hex");
    if (expected.length !== derived.length) return false;
    return timingSafeEqual(derived, expected);
  }

  // Geriye dönük uyumluluk: hash yoksa düz metin şifre (yine sabit-zamanlı).
  const plain = process.env.ADMIN_PASSWORD;
  if (plain) return safeEqual(password, plain);

  return false;
}

/**
 * Kullanıcı adı ve şifreyi ortam değişkenlerine göre doğrular.
 * Node.js runtime gerektirir (node:crypto).
 */
export async function verifyCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  if (!expectedUser) return false;

  // Kullanıcı adı yanlış olsa bile şifre doğrulamasını çalıştır ki
  // yanıt süresi kullanıcı adının doğruluğunu sızdırmasın.
  const userOk = safeEqual(username, expectedUser);
  const passOk = await verifyPassword(password);
  return userOk && passOk;
}
