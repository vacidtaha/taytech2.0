/**
 * Kategori form verisinin sunucu tarafı doğrulaması ve normalleştirilmesi.
 */

import { slugify } from "@/lib/product-input";

export type CategoryCreateInput = {
  nameTr: string;
  nameEn: string;
  slug: string;
  parentId: number | null;
};

export type CategoryUpdateInput = Partial<{
  nameTr: string;
  nameEn: string;
  slug: string;
  parentId: number | null;
  order: number;
}>;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export type CreateResult =
  | { ok: true; data: CategoryCreateInput }
  | { ok: false; error: string };

export function parseCategoryCreate(body: unknown): CreateResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Geçersiz veri." };
  }
  const b = body as Record<string, unknown>;

  const nameTr = str(b.nameTr);
  const nameEn = str(b.nameEn);
  if (!nameTr) return { ok: false, error: "Türkçe kategori adı zorunludur." };
  if (!nameEn) return { ok: false, error: "İngilizce kategori adı zorunludur." };

  const slug = slugify(str(b.slug) || nameTr);
  if (!slug) return { ok: false, error: "Geçerli bir slug üretilemedi." };

  let parentId: number | null = null;
  if (b.parentId != null && b.parentId !== "") {
    const n = Number(b.parentId);
    if (!Number.isInteger(n) || n <= 0) {
      return { ok: false, error: "Geçersiz üst kategori." };
    }
    parentId = n;
  }

  return { ok: true, data: { nameTr, nameEn, slug, parentId } };
}

export type UpdateResult =
  | { ok: true; data: CategoryUpdateInput }
  | { ok: false; error: string };

/** Kısmi güncelleme: yalnızca gönderilen alanları doğrular. */
export function parseCategoryUpdate(body: unknown): UpdateResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Geçersiz veri." };
  }
  const b = body as Record<string, unknown>;
  const data: CategoryUpdateInput = {};

  if ("nameTr" in b) {
    const v = str(b.nameTr);
    if (!v) return { ok: false, error: "Türkçe kategori adı boş olamaz." };
    data.nameTr = v;
  }
  if ("nameEn" in b) {
    const v = str(b.nameEn);
    if (!v) return { ok: false, error: "İngilizce kategori adı boş olamaz." };
    data.nameEn = v;
  }
  if ("slug" in b) {
    const v = slugify(str(b.slug));
    if (!v) return { ok: false, error: "Geçerli bir slug gerekli." };
    data.slug = v;
  }
  if ("parentId" in b) {
    if (b.parentId == null || b.parentId === "") {
      data.parentId = null;
    } else {
      const n = Number(b.parentId);
      if (!Number.isInteger(n) || n <= 0) {
        return { ok: false, error: "Geçersiz üst kategori." };
      }
      data.parentId = n;
    }
  }
  if ("order" in b) {
    const n = Number(b.order);
    if (!Number.isFinite(n)) return { ok: false, error: "Geçersiz sıra." };
    data.order = n;
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, error: "Güncellenecek alan yok." };
  }
  return { ok: true, data };
}
