"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff } from "lucide-react";

export default function GirisPage() {
  const router = useRouter();
  const [step, setStep] = useState<"username" | "password">("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === "username") {
      if (username.trim()) setStep("password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.replace("/yonetim");
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Giriş başarısız.");
        setPassword("");
      }
    } catch {
      setError("Bir hata oluştu. Tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1c1c1e] px-6">
      {/* Sol üst logo */}
      <Link href="/" className="absolute left-6 top-6 flex items-center gap-1.5 md:left-10 md:top-8">
        <Image
          src="/fav.png"
          alt="TayTech"
          width={512}
          height={512}
          className="h-7 w-auto"
        />
        <span className="text-base font-semibold tracking-tight text-white">Yönetim</span>
      </Link>

      {/* Giriş kutusu */}
      <div className="relative z-10 w-full max-w-[690px]">
        <div
          className="flex min-h-[720px] flex-col justify-center rounded-3xl bg-[#1c1c1e] px-12 py-16 md:px-20"
          style={{
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.45)",
          }}
        >
          <div className="mb-10 flex flex-col items-center">
            <Image
              src="/fav.png"
              alt="TayTech"
              width={512}
              height={512}
              className="h-24 w-auto"
            />
          </div>

          <div key={step} className="animate-fade-in">
            <h1 className="mb-8 text-center text-2xl font-bold tracking-tight text-white md:text-3xl">
              {step === "username"
                ? "TayTech kullanıcı adınız ile giriş yapın"
                : "Şifrenizi girin"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-7">
              {step === "username" ? (
                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Kullanıcı adınız"
                    autoComplete="username"
                    autoFocus
                    className="w-full rounded-xl border-2 border-white/20 bg-white/[0.03] py-4 pl-11 pr-4 text-base font-semibold text-white placeholder-white/40 placeholder:font-medium outline-none transition-colors focus:border-[#dc2626] focus:bg-white/[0.05]"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Lock
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Şifreniz"
                    autoComplete="current-password"
                    autoFocus
                    className="w-full rounded-xl border-2 border-white/20 bg-white/[0.03] py-4 pl-11 pr-11 text-base font-semibold text-white placeholder-white/40 placeholder:font-medium outline-none transition-colors focus:border-[#dc2626] focus:bg-white/[0.05]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm font-medium text-[#ff6b6b]">{error}</p>
              )}

              {step === "username" ? (
                <button
                  type="submit"
                  className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-[#1c1c1e] transition-colors hover:bg-white/90"
                >
                  Devam Et
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("username");
                      setPassword("");
                      setError("");
                    }}
                    className="flex-1 rounded-xl bg-[#dc2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
                  >
                    Değiştir
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-white py-3 text-sm font-semibold text-[#1c1c1e] transition-colors hover:bg-white/90 disabled:opacity-60"
                  >
                    {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

      </div>

      {/* Alt footer — kendi açık arka planıyla */}
      <footer className="absolute inset-x-0 bottom-0 bg-[#2a2a2c] px-6 py-4 text-center text-[11px] leading-relaxed text-white/40">
        © 2026 Taytech Enerji Teknolojileri San. ve Tic. A.Ş. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
