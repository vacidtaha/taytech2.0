"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, LogOut, ExternalLink } from "lucide-react";

const NAV = [
  { href: "/yonetim", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/yonetim/urunler", label: "Ürünler", icon: Package },
  { href: "/yonetim/kategoriler", label: "Kategoriler", icon: FolderTree },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/giris");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-white/10 bg-[#1c1c1e] text-white">
      <Link href="/yonetim" className="flex items-center gap-2 px-5 py-6">
        <Image src="/fav.png" alt="Taytech" width={120} height={120} className="h-7 w-auto" />
        <span className="text-base font-semibold">Yönetim</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#dc2626] text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={18} className="shrink-0" />
          Siteyi Gör
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} className="shrink-0" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
