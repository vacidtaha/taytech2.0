"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Loader2,
  AlertCircle,
  X,
  Check,
  Folder,
  Search,
  UnfoldVertical,
  FoldVertical,
} from "lucide-react";
import { slugify } from "@/lib/product-input";
import type { AdminCategory } from "@/lib/catalog";

type TreeNode = AdminCategory & { children: TreeNode[]; depth: number };

const inputCls =
  "w-full rounded-xl border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none transition-colors placeholder:text-[#c4c4c4] focus:border-[#dc2626]";

const EXPANDED_KEY = "yonetim-kategori-acik-dallar";

/* Düz listeyi ağaca çevirir (order'a göre sıralı). */
function buildTree(cats: AdminCategory[]): TreeNode[] {
  const byParent = new Map<number | null, AdminCategory[]>();
  for (const c of cats) {
    const key = c.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.order - b.order);

  const make = (parentId: number | null, depth: number): TreeNode[] =>
    (byParent.get(parentId) ?? []).map((c) => ({
      ...c,
      depth,
      children: make(c.id, depth + 1),
    }));

  return make(null, 0);
}

type ModalState =
  | { mode: "create"; parentId: number | null }
  | { mode: "edit"; category: AdminCategory };

export default function CategoriesAdmin({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const tree = useMemo(() => buildTree(categories), [categories]);

  // Açık dallar oturum boyunca korunur (yenileme sonrası kapanmasın).
  const [expanded, setExpanded] = useState<Set<number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem(EXPANDED_KEY);
        if (raw) return new Set(JSON.parse(raw) as number[]);
      } catch {
        /* bozuk veri — varsayılana dön */
      }
    }
    return new Set(categories.filter((c) => c.parentId === null).map((c) => c.id));
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(EXPANDED_KEY, JSON.stringify([...expanded]));
    } catch {
      /* dolu olabilir — önemsiz */
    }
  }, [expanded]);

  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<AdminCategory | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: number) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandAll = () => setExpanded(new Set(categories.map((c) => c.id)));
  const collapseAll = () => setExpanded(new Set());

  /* --------------------------------- Arama -------------------------------- */
  // Eşleşen kategoriler + onların tüm ataları görünür; eşleşme varken dallar zorla açık.
  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null; // filtre yok
    const byId = new Map(categories.map((c) => [c.id, c]));
    const out = new Set<number>();
    for (const c of categories) {
      const hit =
        c.nameTr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q);
      if (!hit) continue;
      out.add(c.id);
      let cur = c.parentId != null ? byId.get(c.parentId) : undefined;
      let guard = 0;
      while (cur && guard++ < 50) {
        out.add(cur.id);
        cur = cur.parentId != null ? byId.get(cur.parentId) : undefined;
      }
    }
    return out;
  }, [query, categories]);

  const isSearching = visibleIds !== null;

  /* --------------------------------- API ---------------------------------- */

  async function move(node: TreeNode, dir: -1 | 1) {
    const siblings = categories
      .filter((c) => (c.parentId ?? null) === (node.parentId ?? null))
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((c) => c.id === node.id);
    const j = idx + dir;
    if (j < 0 || j >= siblings.length) return;
    const reordered = [...siblings];
    [reordered[idx], reordered[j]] = [reordered[j], reordered[idx]];

    setBusyId(node.id);
    setError(null);
    try {
      // Atomik: kardeş grubunun tüm sırası tek istekte yazılır
      const res = await fetch("/api/admin/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "category", ids: reordered.map((c) => c.id) }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || "Sıralama kaydedilemedi.");
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  /* -------------------------------- Render -------------------------------- */
  const renderNode = (node: TreeNode): React.ReactNode => {
    if (isSearching && !visibleIds!.has(node.id)) return null;

    const hasChildren = node.children.length > 0;
    const isOpen = isSearching || expanded.has(node.id);
    const siblings = categories
      .filter((c) => (c.parentId ?? null) === (node.parentId ?? null))
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex((c) => c.id === node.id);
    const deleteBlocked = node.childCount > 0;

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-2 rounded-xl border border-transparent py-2 pr-2 transition-colors hover:bg-[#f5f5f7] ${
            busyId === node.id ? "opacity-50" : ""
          }`}
          style={{ paddingLeft: node.depth * 24 + 4 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(node.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#86868b] hover:bg-white"
              aria-label={isOpen ? "Daralt" : "Genişlet"}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#d2d2d7]">
              <Folder size={15} />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-[#1d1d1f]">
                {node.nameTr}
              </span>
              <span className="truncate text-[13px] text-[#86868b]">· {node.nameEn}</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-[#a1a1a6]">
              <code className="rounded bg-[#f0f0f0] px-1.5 py-0.5 text-[#86868b]">
                /{node.slug}
              </code>
              <span>{node.totalProductCount} ürün</span>
              {node.childCount > 0 && <span>· {node.childCount} alt kategori</span>}
              {node.totalProductCount === 0 && node.childCount === 0 && (
                <span className="rounded bg-[#fef3c7] px-1.5 py-px font-medium text-[#b45309]">
                  Boş
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => move(node, -1)}
              disabled={idx === 0 || busyId !== null || isSearching}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
              aria-label="Yukarı"
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              onClick={() => move(node, 1)}
              disabled={idx === siblings.length - 1 || busyId !== null || isSearching}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
              aria-label="Aşağı"
            >
              <ArrowDown size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                setExpanded((s) => new Set(s).add(node.id));
                setModal({ mode: "create", parentId: node.id });
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white hover:text-[#0071e3]"
              aria-label="Alt kategori ekle"
              title="Alt kategori ekle"
            >
              <FolderPlus size={16} />
            </button>
            <button
              type="button"
              onClick={() => setModal({ mode: "edit", category: node })}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white hover:text-[#1d1d1f]"
              aria-label="Düzenle"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDel(node)}
              disabled={busyId !== null || deleteBlocked}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#fee2e2] hover:text-[#dc2626] disabled:cursor-not-allowed disabled:opacity-25"
              aria-label="Sil"
              title={
                deleteBlocked
                  ? "Silinemez: önce alt kategorileri taşıyın veya silin"
                  : node.directProductCount > 0
                  ? "Silmek için içindeki ürünler başka kategoriye taşınacak"
                  : "Kategoriyi sil"
              }
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {hasChildren && isOpen && <div>{node.children.map(renderNode)}</div>}
      </div>
    );
  };

  const visibleTree = tree.map(renderNode).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Kategoriler</h1>
          <p className="mt-2 text-[15px] text-[#86868b]">
            {categories.length} kategori · menü bu ağaçtan türetilir
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ mode: "create", parentId: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
        >
          <Plus size={18} /> Yeni Ana Kategori
        </button>
      </header>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Arama + aç/kapat */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868b]"
          />
          <input
            type="text"
            placeholder="Kategori ara (ad, slug)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-[#e5e5e5] bg-white py-2.5 pl-10 pr-9 text-sm outline-none transition-colors focus:border-[#dc2626]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
              aria-label="Aramayı temizle"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={expandAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#424245] hover:bg-[#f5f5f7]"
        >
          <UnfoldVertical size={14} /> Tümünü aç
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#424245] hover:bg-[#f5f5f7]"
        >
          <FoldVertical size={14} /> Tümünü kapat
        </button>
      </div>

      {isSearching && (
        <p className="mb-3 text-[13px] text-[#86868b]">
          Arama sonuçları gösteriliyor — sıralama okları aramada devre dışıdır.
        </p>
      )}

      <div className="rounded-2xl border border-[#e5e5e5] bg-white p-2">
        {tree.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-medium text-[#1d1d1f]">Henüz kategori yok</p>
            <p className="mt-1 text-[13px] text-[#86868b]">
              İlk kategoriyi eklemek için “Yeni Ana Kategori”ye tıklayın.
            </p>
          </div>
        ) : visibleTree.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-medium text-[#1d1d1f]">Eşleşen kategori yok</p>
            <p className="mt-1 text-[13px] text-[#86868b]">Farklı bir arama deneyin.</p>
          </div>
        ) : (
          visibleTree
        )}
      </div>

      {/* Ekle / Düzenle modalı */}
      {modal && (
        <CategoryModal
          modal={modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            router.refresh();
          }}
        />
      )}

      {/* Silme onayı (gerekirse ürün taşıma seçimiyle) */}
      {confirmDel && (
        <DeleteModal
          category={confirmDel}
          categories={categories}
          onClose={() => setConfirmDel(null)}
          onDeleted={(msg) => {
            setConfirmDel(null);
            if (msg) setError(msg);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ----------------------------- Silme modalı ------------------------------- */

function DeleteModal({
  category,
  categories,
  onClose,
  onDeleted,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
  onClose: () => void;
  onDeleted: (errorMsg?: string) => void;
}) {
  const needsMove = category.directProductCount > 0;
  const [moveTo, setMoveTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hedef seçenekleri: silinecek kategorinin kendisi hariç, ağaç sırasına göre girintili.
  const targets = useMemo(() => {
    const byParent = new Map<number | null, AdminCategory[]>();
    for (const c of categories) {
      const key = c.parentId ?? null;
      const list = byParent.get(key) ?? [];
      list.push(c);
      byParent.set(key, list);
    }
    for (const list of byParent.values()) list.sort((a, b) => a.order - b.order);
    const out: { id: number; label: string; depth: number }[] = [];
    const walk = (pid: number | null, depth: number) => {
      for (const c of byParent.get(pid) ?? []) {
        if (c.id !== category.id) out.push({ id: c.id, label: c.nameTr, depth });
        walk(c.id, depth + 1);
      }
    };
    walk(null, 0);
    return out;
  }, [categories, category.id]);

  async function doDelete() {
    if (needsMove && moveTo == null) {
      setError("Ürünlerin taşınacağı kategoriyi seçin.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const qs = needsMove && moveTo != null ? `?moveProductsTo=${moveTo}` : "";
      const res = await fetch(`/api/admin/categories/${category.id}${qs}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error || "Silinemedi.");
        setBusy(false);
        return;
      }
      onDeleted();
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[#1d1d1f]">Kategoriyi sil?</h3>
        <p className="mt-2 text-sm text-[#86868b]">
          <span className="font-medium text-[#1d1d1f]">{category.nameTr}</span> kalıcı
          olarak silinecek. Bu işlem geri alınamaz.
        </p>

        {needsMove && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-[#424245]">
              Bu kategoride <strong>{category.directProductCount} ürün</strong> var.
              Silmeden önce ürünler seçeceğiniz kategoriye taşınacak:
            </p>
            <select
              className={inputCls}
              value={moveTo ?? ""}
              onChange={(e) => setMoveTo(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— Hedef kategori seç —</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {`${"\u00A0\u00A0".repeat(t.depth)}${t.label}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-[#dc2626]">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={doDelete}
            disabled={busy || (needsMove && moveTo == null)}
            className="rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-50"
          >
            {busy ? "Siliniyor…" : needsMove ? "Taşı ve Sil" : "Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Modal ---------------------------------- */

function CategoryModal({
  modal,
  categories,
  onClose,
  onSaved,
}: {
  modal: ModalState;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = modal.mode === "edit";
  const editing = isEdit ? modal.category : null;

  const [nameTr, setNameTr] = useState(editing?.nameTr ?? "");
  const [nameEn, setNameEn] = useState(editing?.nameEn ?? "");
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [parentId, setParentId] = useState<number | null>(
    isEdit ? editing!.parentId : modal.parentId
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveSlug = slugTouched ? slug : slugify(nameTr);
  const slugChanged = isEdit && slugify(effectiveSlug) !== editing!.slug;

  // Üst kategori seçenekleri: düzenlemede kendisi ve alt ağacı hariç.
  const parentOptions = useMemo(() => {
    const excluded = new Set<number>();
    if (isEdit && editing) {
      const byParent = new Map<number | null, AdminCategory[]>();
      for (const c of categories) {
        const key = c.parentId ?? null;
        const list = byParent.get(key) ?? [];
        list.push(c);
        byParent.set(key, list);
      }
      const stack = [editing.id];
      excluded.add(editing.id);
      while (stack.length) {
        const cur = stack.pop()!;
        for (const child of byParent.get(cur) ?? []) {
          if (!excluded.has(child.id)) {
            excluded.add(child.id);
            stack.push(child.id);
          }
        }
      }
    }
    // Ağaç sırasına göre girintili düz liste
    const byParent = new Map<number | null, AdminCategory[]>();
    for (const c of categories) {
      const key = c.parentId ?? null;
      const list = byParent.get(key) ?? [];
      list.push(c);
      byParent.set(key, list);
    }
    for (const list of byParent.values()) list.sort((a, b) => a.order - b.order);
    const out: { id: number; label: string; depth: number }[] = [];
    const walk = (pid: number | null, depth: number) => {
      for (const c of byParent.get(pid) ?? []) {
        if (!excluded.has(c.id)) {
          out.push({ id: c.id, label: c.nameTr, depth });
          walk(c.id, depth + 1);
        }
      }
    };
    walk(null, 0);
    return out;
  }, [categories, isEdit, editing]);

  async function save() {
    setError(null);
    if (!nameTr.trim()) return setError("Türkçe ad zorunludur.");
    if (!nameEn.trim()) return setError("İngilizce ad zorunludur.");
    const finalSlug = slugify(effectiveSlug);
    if (!finalSlug) return setError("Geçerli bir slug gerekli.");

    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/categories/${editing!.id}` : "/api/admin/categories",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nameTr: nameTr.trim(),
            nameEn: nameEn.trim(),
            slug: finalSlug,
            parentId,
          }),
        }
      );
      if (res.status === 401) {
        setError("Oturumunuz sona erdi. Yeni sekmede giriş yapıp tekrar deneyin.");
        setSaving(false);
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error || "Kaydedilemedi.");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1d1d1f]">
            {isEdit ? "Kategoriyi Düzenle" : "Yeni Kategori"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#f5f5f7]"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#424245]">Ad (TR)</span>
            <input
              className={inputCls}
              value={nameTr}
              onChange={(e) => setNameTr(e.target.value)}
              placeholder="örn. Akıllı Seri"
              autoFocus
              maxLength={100}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#424245]">Ad (EN)</span>
            <input
              className={inputCls}
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Smart Series"
              maxLength={100}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#424245]">
              Slug <span className="font-normal text-[#a1a1a6]">(URL adresi)</span>
            </span>
            <input
              className={inputCls}
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              onBlur={(e) => {
                if (slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="akilli-seri"
            />
            {slugChanged && (
              <span className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-[#fffbeb] px-3 py-2 text-[12px] leading-snug text-[#b45309]">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                Slug değişirse eski adres (/urunler/{editing!.slug}) çalışmaz olur;
                dışarıdan verilmiş linkler ve arama motoru kayıtları kırılabilir.
              </span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-[#424245]">
              Üst Kategori
            </span>
            <select
              className={inputCls}
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">— Ana kategori (üst yok) —</option>
              {parentOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {`${"\u00A0\u00A0".repeat(o.depth)}${o.label}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-1.5 text-[13px] text-[#dc2626]">
            <AlertCircle size={14} /> {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Kaydediliyor…
              </>
            ) : (
              <>
                <Check size={16} /> Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
