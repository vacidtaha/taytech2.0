import Link from "next/link";
import {
  Package,
  FolderTree,
  FileText,
  Plus,
  ArrowRight,
  AlertTriangle,
  Clock,
  PackageX,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/db";
import eksikUrunler from "@/data/eksik-urunler.json";

export const dynamic = "force-dynamic";

type EksikUrun = { tr: string; en: string; slug: string; href: string; neden: string };

export default async function YonetimDashboard() {
  const [
    productCount,
    activeCount,
    categoryCount,
    documentCount,
    orphanCount,
    noImageCount,
    noDocCount,
    recentProducts,
    allCategories,
    allSlugs,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.document.count(),
    prisma.product.count({ where: { categoryId: null } }),
    prisma.product.count({ where: { mainImageTr: null, mainImageEn: null } }),
    prisma.product.count({ where: { documents: { none: {} } } }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, nameTr: true, isActive: true, updatedAt: true },
    }),
    prisma.category.findMany({
      select: { id: true, nameTr: true, parentId: true },
    }),
    prisma.product.findMany({ select: { slug: true } }),
  ]);

  const passiveCount = productCount - activeCount;

  // Boş kategoriler: ne kendisinde ne alt ağacında ürün var
  const productByCat = await prisma.product.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
  });
  const directCount = new Map<number, number>();
  for (const g of productByCat) {
    if (g.categoryId != null) directCount.set(g.categoryId, g._count._all);
  }
  const childrenByParent = new Map<number | null, typeof allCategories>();
  for (const c of allCategories) {
    const key = c.parentId ?? null;
    const list = childrenByParent.get(key) ?? [];
    list.push(c);
    childrenByParent.set(key, list);
  }
  const totalFor = (id: number): number => {
    let n = directCount.get(id) ?? 0;
    for (const child of childrenByParent.get(id) ?? []) n += totalFor(child.id);
    return n;
  };
  const emptyCategoryCount = allCategories.filter(
    (c) => totalFor(c.id) === 0 && (childrenByParent.get(c.id) ?? []).length === 0
  ).length;

  // Eski siteden bilinen ama hâlâ eklenmemiş ürünler (eklenenler listeden düşer)
  const dbSlugs = new Set(allSlugs.map((s) => s.slug));
  const missing = (eksikUrunler as EksikUrun[]).filter((m) => !dbSlugs.has(m.slug));

  const stats = [
    {
      label: "Ürün",
      value: productCount,
      sub: `${activeCount} aktif`,
      icon: Package,
      href: "/yonetim/urunler",
    },
    {
      label: "Kategori",
      value: categoryCount,
      sub: "menü ağacı",
      icon: FolderTree,
      href: "/yonetim/kategoriler",
    },
    {
      label: "Doküman",
      value: documentCount,
      sub: "tüm ürünler",
      icon: FileText,
      href: "/dokuman-merkezi",
    },
  ];

  const warnings = [
    {
      count: orphanCount,
      label: "kategorisiz ürün",
      desc: "Menüde ve kategori sayfalarında görünmüyor",
      href: "/yonetim/urunler?filtre=kategorisiz",
    },
    {
      count: noImageCount,
      label: "görselsiz ürün",
      desc: "Ana görseli olmayan ürünler",
      href: "/yonetim/urunler?filtre=gorselsiz",
    },
    {
      count: noDocCount,
      label: "dokümansız ürün",
      desc: "Hiç katalog/kılavuz eklenmemiş",
      href: "/yonetim/urunler?filtre=dokumansiz",
    },
    {
      count: passiveCount,
      label: "pasif ürün",
      desc: "Sitede yayında değil",
      href: "/yonetim/urunler?filtre=pasif",
    },
    {
      count: emptyCategoryCount,
      label: "boş kategori",
      desc: "İçinde hiç ürün yok",
      href: "/yonetim/kategoriler",
    },
  ].filter((w) => w.count > 0);

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Panel</h1>
        <p className="mt-2 text-[15px] text-[#86868b]">
          Ürünleri, kategorileri ve dokümanları buradan yönetin.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        {stats.map(({ label, value, sub, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-[#e5e5e5] bg-white p-6 transition-all hover:border-[#d2d2d7] hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f7] text-[#dc2626]">
                <Icon size={20} />
              </span>
              <ArrowRight
                size={18}
                className="text-[#c4c4c4] transition-transform group-hover:translate-x-1 group-hover:text-[#1d1d1f]"
              />
            </div>
            <p className="mt-4 text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-sm font-medium text-[#1d1d1f]">{label}</p>
            <p className="text-[13px] text-[#86868b]">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/yonetim/urunler/yeni"
          className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
        >
          <Plus size={18} className="shrink-0" />
          Yeni Ürün Ekle
        </Link>
        <Link
          href="/yonetim/kategoriler"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-5 py-3 text-sm font-semibold text-[#1d1d1f] transition-colors hover:border-[#d2d2d7]"
        >
          <FolderTree size={18} className="shrink-0" />
          Kategorileri Düzenle
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Dikkat gerekenler */}
        <section className="rounded-2xl border border-[#e5e5e5] bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1d1d1f]">
            <AlertTriangle size={18} className="text-[#f59e0b]" /> Dikkat Gerekenler
          </h2>
          {warnings.length === 0 ? (
            <p className="mt-4 text-sm text-[#86868b]">
              Harika — dikkat gerektiren bir durum yok.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[#f0f0f0]">
              {warnings.map((w) => (
                <li key={w.label}>
                  <Link
                    href={w.href}
                    className="group flex items-center gap-3 py-3 transition-colors hover:bg-[#fafafa]"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fef3c7] text-sm font-semibold text-[#b45309]">
                      {w.count}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#1d1d1f]">
                        {w.count} {w.label}
                      </span>
                      <span className="block truncate text-[13px] text-[#86868b]">
                        {w.desc}
                      </span>
                    </span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[#c4c4c4] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Son düzenlenenler */}
        <section className="rounded-2xl border border-[#e5e5e5] bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1d1d1f]">
            <Clock size={18} className="text-[#0071e3]" /> Son Düzenlenenler
          </h2>
          {recentProducts.length === 0 ? (
            <p className="mt-4 text-sm text-[#86868b]">Henüz ürün yok.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#f0f0f0]">
              {recentProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/yonetim/urunler/${p.id}`}
                    className="group flex items-center gap-3 py-3 transition-colors hover:bg-[#fafafa]"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        p.isActive ? "bg-[#34c759]" : "bg-[#d2d2d7]"
                      }`}
                      title={p.isActive ? "Aktif" : "Pasif"}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#1d1d1f]">
                      {p.nameTr}
                    </span>
                    <span className="shrink-0 text-[12px] text-[#a1a1a6]">
                      {dateFmt.format(p.updatedAt)}
                    </span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[#c4c4c4] transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Eklenmemiş ürünler (eski siteden bilinen) */}
      <section className="mt-6 rounded-2xl border border-[#e5e5e5] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1d1d1f]">
            <PackageX size={18} className="text-[#dc2626]" /> Eklenmemiş Ürünler
            <span className="rounded-full bg-[#fee2e2] px-2.5 py-0.5 text-[13px] font-semibold text-[#dc2626]">
              {missing.length}
            </span>
          </h2>
          <p className="text-[13px] text-[#86868b]">
            Eski sitenin menüsünde vardı ama içerikleri hiç hazırlanmamıştı. Ekledikçe
            listeden otomatik düşer.
          </p>
        </div>
        {missing.length === 0 ? (
          <p className="mt-4 text-sm text-[#86868b]">
            Tebrikler — bilinen tüm ürünler eklendi.
          </p>
        ) : (
          <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
            {missing.map((m) => (
              <li key={m.slug} className="border-b border-[#f0f0f0]">
                <Link
                  href="/yonetim/urunler/yeni"
                  className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-[#fafafa]"
                  title="Bu ürünü eklemeye başla"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#1d1d1f]">
                      {m.tr}
                    </span>
                    <span className="block truncate text-[12px] text-[#a1a1a6]">
                      {m.en} · {m.slug}
                    </span>
                  </span>
                  <Plus
                    size={15}
                    className="shrink-0 text-[#c4c4c4] transition-colors group-hover:text-[#dc2626]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
