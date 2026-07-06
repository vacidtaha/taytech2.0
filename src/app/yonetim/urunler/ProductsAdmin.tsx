"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  ImageOff,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export type ProductFilter = "all" | "kategorisiz" | "gorselsiz" | "dokumansiz" | "pasif";

type ProductRow = {
  id: number;
  slug: string;
  nameTr: string;
  nameEn: string;
  desc: string;
  isActive: boolean;
  order: number;
  image: string | null;
  categoryName: string | null;
  documentCount: number;
};

type SortKey = "order" | "name" | "category";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

const FILTER_TABS: { key: ProductFilter; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "kategorisiz", label: "Kategorisiz" },
  { key: "gorselsiz", label: "Görselsiz" },
  { key: "dokumansiz", label: "Dokümansız" },
  { key: "pasif", label: "Pasif" },
];

export default function ProductsAdmin({
  products,
  initialFilter = "all",
}: {
  products: ProductRow[];
  initialFilter?: ProductFilter;
}) {
  const router = useRouter();

  // Optimistic yerel kopya: prop değişince (router.refresh) yeniden eşitlenir.
  const [rows, setRows] = useState<ProductRow[]>(products);
  useEffect(() => setRows(products), [products]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductFilter>(initialFilter);
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<"delete" | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function fail(msg: string) {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  }

  /* ------------------------------ Filtre + arama --------------------------- */
  const filtered = useMemo(() => {
    let list = [...rows].sort((a, b) => a.order - b.order);

    if (filter === "kategorisiz") list = list.filter((p) => !p.categoryName);
    else if (filter === "gorselsiz") list = list.filter((p) => !p.image);
    else if (filter === "dokumansiz") list = list.filter((p) => p.documentCount === 0);
    else if (filter === "pasif") list = list.filter((p) => !p.isActive);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.nameTr.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.categoryName ?? "").toLowerCase().includes(q) ||
          p.desc.includes(q)
      );
    }

    if (sortKey === "name") {
      list.sort((a, b) => a.nameTr.localeCompare(b.nameTr, "tr"));
      if (sortDir === "desc") list.reverse();
    } else if (sortKey === "category") {
      list.sort((a, b) =>
        (a.categoryName ?? "\uffff").localeCompare(b.categoryName ?? "\uffff", "tr")
      );
      if (sortDir === "desc") list.reverse();
    }
    return list;
  }, [rows, search, filter, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Filtre/arama/sıralama değişince ilk sayfaya dön
  useEffect(() => setPage(1), [search, filter, sortKey, sortDir]);

  // Sıralama okları yalnızca doğal düzende anlamlı
  const canReorder =
    !search.trim() && filter === "all" && sortKey === "order";

  function toggleSort(key: Exclude<SortKey, "order">) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey("order");
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  /* --------------------------------- API ---------------------------------- */

  async function toggleActive(p: ProductRow) {
    // Optimistic: önce arayüzü güncelle, hata olursa geri al
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, isActive: !r.isActive } : r)));
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (!res.ok) {
        setRows(prev);
        fail("Durum değiştirilemedi.");
      } else {
        router.refresh();
      }
    } catch {
      setRows(prev);
      fail("Sunucuya ulaşılamadı.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(p: ProductRow, dir: -1 | 1) {
    const ordered = [...rows].sort((a, b) => a.order - b.order);
    const idx = ordered.findIndex((x) => x.id === p.id);
    const j = idx + dir;
    if (j < 0 || j >= ordered.length) return;
    [ordered[idx], ordered[j]] = [ordered[j], ordered[idx]];

    // Optimistic: order = index olarak yeniden yaz
    const prev = rows;
    const next = ordered.map((r, i) => ({ ...r, order: i }));
    setRows(next);
    setBusyId(p.id);
    try {
      // Atomik: tüm sıra tek istekte, tek transaction'da yazılır
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "product", ids: ordered.map((r) => r.id) }),
      });
      if (!res.ok) {
        setRows(prev);
        fail("Sıralama kaydedilemedi.");
      } else {
        router.refresh();
      }
    } catch {
      setRows(prev);
      fail("Sunucuya ulaşılamadı.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmId(null);
        setRows((rs) => rs.filter((r) => r.id !== id));
        showToast("Ürün silindi");
        router.refresh();
      } else {
        fail("Silinemedi.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function clone(p: ProductRow) {
    setBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}/clone`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        showToast(`"${p.nameTr}" kopyalandı (pasif olarak)`);
        router.refresh();
      } else {
        fail(json.error || "Kopyalanamadı.");
      }
    } catch {
      fail("Sunucuya ulaşılamadı.");
    } finally {
      setBusyId(null);
    }
  }

  /* ------------------------------ Toplu işlemler --------------------------- */

  const pageIds = pageRows.map((r) => r.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  function toggleSelectAll() {
    setSelected((s) => {
      const next = new Set(s);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleSelect(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulk(action: "activate" | "deactivate" | "delete") {
    if (selected.size === 0) return;
    setBulkBusy(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: [...selected] }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        const labels = {
          activate: "aktifleştirildi",
          deactivate: "pasifleştirildi",
          delete: "silindi",
        } as const;
        showToast(`${json.count} ürün ${labels[action]}`);
        setSelected(new Set());
        setBulkConfirm(null);
        router.refresh();
      } else {
        fail(json.error || "Toplu işlem başarısız.");
      }
    } catch {
      fail("Sunucuya ulaşılamadı.");
    } finally {
      setBulkBusy(false);
    }
  }

  /* -------------------------------- Render -------------------------------- */

  const activeTotal = rows.filter((p) => p.isActive).length;

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Ürünler</h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            {rows.length} ürün · {activeTotal} aktif
          </p>
        </div>
        <Link
          href="/yonetim/urunler/yeni"
          className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
        >
          <Plus size={18} className="shrink-0" />
          Yeni Ürün
        </Link>
      </header>

      {/* Bildirimler */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl bg-[#1d1d1f] px-5 py-3 text-sm font-medium text-white shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#34c759]" /> {toast}
          </span>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filtre sekmeleri */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((t) => {
          const count =
            t.key === "all"
              ? rows.length
              : t.key === "kategorisiz"
              ? rows.filter((p) => !p.categoryName).length
              : t.key === "gorselsiz"
              ? rows.filter((p) => !p.image).length
              : t.key === "dokumansiz"
              ? rows.filter((p) => p.documentCount === 0).length
              : rows.filter((p) => !p.isActive).length;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                filter === t.key
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white text-[#424245] ring-1 ring-[#e5e5e5] hover:bg-[#f5f5f7]"
              }`}
            >
              {t.label}
              {count > 0 && t.key !== "all" && (
                <span className={filter === t.key ? "ml-1.5 opacity-70" : "ml-1.5 text-[#a1a1a6]"}>
                  {count}
                </span>
              )}
              {t.key === "all" && <span className="ml-1.5 opacity-70">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Arama */}
      <div className="relative mb-5">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]"
        />
        <input
          type="text"
          placeholder="Ürün ara (ad, slug, kategori, açıklama)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#e5e5e5] bg-white py-3 pl-11 pr-10 text-sm outline-none transition-colors focus:border-[#dc2626]"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Toplu işlem çubuğu */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#e5e5e5] bg-white px-4 py-3">
          <span className="text-sm font-medium text-[#1d1d1f]">
            {selected.size} ürün seçili
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => bulk("activate")}
              disabled={bulkBusy}
              className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-50"
            >
              Aktifleştir
            </button>
            <button
              onClick={() => bulk("deactivate")}
              disabled={bulkBusy}
              className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-50"
            >
              Pasifleştir
            </button>
            <button
              onClick={() => setBulkConfirm("delete")}
              disabled={bulkBusy}
              className="rounded-lg border border-[#fecaca] px-3 py-1.5 text-[13px] font-medium text-[#dc2626] hover:bg-[#fee2e2] disabled:opacity-50"
            >
              Sil
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f]"
          >
            Seçimi temizle
          </button>
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] bg-[#fafafa] text-[13px] text-[#86868b]">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 accent-[#dc2626]"
                  aria-label="Sayfadakilerin tümünü seç"
                />
              </th>
              {canReorder && <th className="w-12 px-3 py-3 text-center">Sıra</th>}
              <th className="px-4 py-3 font-medium">
                <button
                  onClick={() => toggleSort("name")}
                  className="inline-flex items-center gap-1 hover:text-[#1d1d1f]"
                >
                  Ürün
                  <ChevronsUpDown
                    size={13}
                    className={sortKey === "name" ? "text-[#dc2626]" : ""}
                  />
                </button>
              </th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                <button
                  onClick={() => toggleSort("category")}
                  className="inline-flex items-center gap-1 hover:text-[#1d1d1f]"
                >
                  Kategori
                  <ChevronsUpDown
                    size={13}
                    className={sortKey === "category" ? "text-[#dc2626]" : ""}
                  />
                </button>
              </th>
              <th className="hidden px-4 py-3 text-center font-medium sm:table-cell">Doküman</th>
              <th className="px-4 py-3 text-center font-medium">Durum</th>
              <th className="px-4 py-3 text-right font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => {
              const naturalIdx = filtered.findIndex((x) => x.id === p.id);
              return (
                <tr
                  key={p.id}
                  className={`border-b border-[#f0f0f0] last:border-0 ${
                    busyId === p.id ? "opacity-50" : ""
                  } ${selected.has(p.id) ? "bg-[#fef2f2]" : ""}`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="h-4 w-4 accent-[#dc2626]"
                      aria-label={`${p.nameTr} seç`}
                    />
                  </td>
                  {canReorder && (
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => move(p, -1)}
                          disabled={naturalIdx === 0 || busyId !== null}
                          className="text-[#86868b] transition-colors hover:text-[#1d1d1f] disabled:opacity-25"
                          aria-label="Yukarı taşı"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          onClick={() => move(p, 1)}
                          disabled={naturalIdx === filtered.length - 1 || busyId !== null}
                          className="text-[#86868b] transition-colors hover:text-[#1d1d1f] disabled:opacity-25"
                          aria-label="Aşağı taşı"
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f7]">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <ImageOff size={16} className="text-[#c4c4c4]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#1d1d1f]">{p.nameTr}</p>
                        <p className="truncate text-[13px] text-[#86868b]">{p.nameEn}</p>
                        {/* Uyarı rozetleri */}
                        {(!p.categoryName || !p.image || p.documentCount === 0) && (
                          <span className="mt-0.5 flex flex-wrap gap-1">
                            {!p.categoryName && (
                              <span className="rounded bg-[#fef3c7] px-1.5 py-px text-[11px] font-medium text-[#b45309]">
                                Kategorisiz
                              </span>
                            )}
                            {!p.image && (
                              <span className="rounded bg-[#fef3c7] px-1.5 py-px text-[11px] font-medium text-[#b45309]">
                                Görsel yok
                              </span>
                            )}
                            {p.documentCount === 0 && (
                              <span className="rounded bg-[#f0f0f0] px-1.5 py-px text-[11px] font-medium text-[#86868b]">
                                Doküman yok
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-[#424245] md:table-cell">
                    {p.categoryName ?? <span className="text-[#c4c4c4]">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-[#424245] sm:table-cell">
                    {p.documentCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleActive(p)}
                        disabled={busyId !== null}
                        aria-label={p.isActive ? "Pasifleştir" : "Aktifleştir"}
                        role="switch"
                        aria-checked={p.isActive}
                        className={`relative h-[26px] w-[46px] shrink-0 rounded-full p-0 transition-colors duration-200 ease-out ${
                          p.isActive ? "bg-[#34c759]" : "bg-[#d2d2d7]"
                        }`}
                      >
                        <span
                          className={`absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out ${
                            p.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`/urun/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#86868b] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                        aria-label="Sitede gör"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => clone(p)}
                        disabled={busyId !== null}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#86868b] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                        aria-label="Kopyala"
                        title="Ürünü kopyala (kopya pasif başlar)"
                      >
                        <Copy size={16} />
                      </button>
                      <Link
                        href={`/yonetim/urunler/${p.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#86868b] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
                        aria-label="Düzenle"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => setConfirmId(p.id)}
                        disabled={busyId !== null}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#86868b] transition-colors hover:bg-[#fee2e2] hover:text-[#dc2626]"
                        aria-label="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pageRows.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-medium text-[#1d1d1f]">
              {search.trim() || filter !== "all" ? "Eşleşen ürün yok" : "Henüz ürün yok"}
            </p>
            <p className="mt-1 text-[13px] text-[#86868b]">
              {search.trim() || filter !== "all"
                ? "Farklı bir arama ya da filtre deneyin."
                : "İlk ürünü eklemek için “Yeni Ürün”e tıklayın."}
            </p>
          </div>
        )}
      </div>

      {/* Sayfalama */}
      {pageCount > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#424245] hover:bg-[#f5f5f7] disabled:opacity-40"
            aria-label="Önceki sayfa"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13px] text-[#86868b]">
            Sayfa {safePage} / {pageCount} · {filtered.length} ürün
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={safePage >= pageCount}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-[#424245] hover:bg-[#f5f5f7] disabled:opacity-40"
            aria-label="Sonraki sayfa"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Tekli silme onayı */}
      {confirmId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setConfirmId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Ürünü sil?</h3>
            <p className="mt-2 text-sm text-[#86868b]">
              Bu işlem geri alınamaz. Ürün ve ona bağlı dokümanlar kalıcı olarak silinir.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                Vazgeç
              </button>
              <button
                onClick={() => remove(confirmId)}
                disabled={busyId !== null}
                className="rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-60"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toplu silme onayı */}
      {bulkConfirm === "delete" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setBulkConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1d1d1f]">
              {selected.size} ürünü sil?
            </h3>
            <p className="mt-2 text-sm text-[#86868b]">
              Bu işlem geri alınamaz. Seçili ürünler ve onlara bağlı tüm dokümanlar
              kalıcı olarak silinir.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setBulkConfirm(null)}
                className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                Vazgeç
              </button>
              <button
                onClick={() => bulk("delete")}
                disabled={bulkBusy}
                className="rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-60"
              >
                Tümünü Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
