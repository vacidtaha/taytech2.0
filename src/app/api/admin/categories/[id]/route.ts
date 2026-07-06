import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { parseCategoryUpdate } from "@/lib/category-input";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Bir kategorinin (kendisi dahil) tüm alt ağaç kimliklerini toplar. */
async function collectDescendants(rootId: number): Promise<Set<number>> {
  const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const childrenByParent = new Map<number, number[]>();
  for (const c of all) {
    if (c.parentId != null) {
      const list = childrenByParent.get(c.parentId) ?? [];
      list.push(c.id);
      childrenByParent.set(c.parentId, list);
    }
  }
  const set = new Set<number>([rootId]);
  const stack = [rootId];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const child of childrenByParent.get(cur) ?? []) {
      if (!set.has(child)) {
        set.add(child);
        stack.push(child);
      }
    }
  }
  return set;
}

/** Kategori güncelle (ad, slug, üst kategori, sıra). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  const { id: idRaw } = await params;
  const id = parseId(idRaw);
  if (!id) return NextResponse.json({ ok: false, error: "Geçersiz kimlik." }, { status: 400 });

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true, parentId: true },
  });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Kategori bulunamadı." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz gövde." }, { status: 400 });
  }

  const parsed = parseCategoryUpdate(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;

  // Slug benzersizliği
  if (data.slug !== undefined) {
    const clash = await prisma.category.findFirst({
      where: { slug: data.slug, NOT: { id } },
      select: { id: true },
    });
    if (clash) {
      return NextResponse.json(
        { ok: false, error: `"${data.slug}" slug'ı başka bir kategoride kullanılıyor.` },
        { status: 409 }
      );
    }
  }

  // Üst kategori: kendisi ya da alt ağacındaki bir kategori olamaz (döngü engeli)
  if (data.parentId !== undefined && data.parentId !== null) {
    if (data.parentId === id) {
      return NextResponse.json(
        { ok: false, error: "Bir kategori kendi üst kategorisi olamaz." },
        { status: 400 }
      );
    }
    const parent = await prisma.category.findUnique({
      where: { id: data.parentId },
      select: { id: true },
    });
    if (!parent) {
      return NextResponse.json({ ok: false, error: "Üst kategori bulunamadı." }, { status: 400 });
    }
    const descendants = await collectDescendants(id);
    if (descendants.has(data.parentId)) {
      return NextResponse.json(
        { ok: false, error: "Üst kategori olarak bir alt kategori seçilemez (döngü oluşur)." },
        { status: 400 }
      );
    }
  }

  // Üst kategori değişiyorsa sıra değeri yeni kardeşlerin sonuna alınır;
  // eski order değeri yeni kardeşlerinkiyle çakışıp sıralamayı bozmasın.
  if (
    data.parentId !== undefined &&
    (data.parentId ?? null) !== (existing.parentId ?? null) &&
    data.order === undefined
  ) {
    const last = await prisma.category.aggregate({
      where: { parentId: data.parentId },
      _max: { order: true },
    });
    data.order = (last._max.order ?? -1) + 1;
  }

  try {
    await prisma.category.update({ where: { id }, data });
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Kategori güncellenemedi." }, { status: 500 });
  }
}

/**
 * Kategori sil.
 * - Alt kategorisi varsa her durumda engellenir.
 * - Ürünü varsa: ?moveProductsTo=<id> ile ürünler önce hedef kategoriye
 *   (transaction içinde) taşınır, sonra kategori silinir. Parametre yoksa engellenir.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  const { id: idRaw } = await params;
  const id = parseId(idRaw);
  if (!id) return NextResponse.json({ ok: false, error: "Geçersiz kimlik." }, { status: 400 });

  const [childCount, productCount] = await Promise.all([
    prisma.category.count({ where: { parentId: id } }),
    prisma.product.count({ where: { categoryId: id } }),
  ]);

  if (childCount > 0) {
    return NextResponse.json(
      { ok: false, error: "Önce alt kategorileri taşıyın veya silin." },
      { status: 409 }
    );
  }

  const moveToRaw = new URL(req.url).searchParams.get("moveProductsTo");
  let moveTo: number | null = null;
  if (moveToRaw != null && moveToRaw !== "") {
    moveTo = parseId(moveToRaw);
    if (!moveTo || moveTo === id) {
      return NextResponse.json({ ok: false, error: "Geçersiz hedef kategori." }, { status: 400 });
    }
    const target = await prisma.category.findUnique({
      where: { id: moveTo },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ ok: false, error: "Hedef kategori bulunamadı." }, { status: 400 });
    }
  }

  if (productCount > 0 && moveTo == null) {
    return NextResponse.json(
      {
        ok: false,
        error: `Bu kategoride ${productCount} ürün var. Silmek için ürünleri taşıyacağınız kategoriyi seçin.`,
        needsMove: true,
        productCount,
      },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction([
      ...(productCount > 0 && moveTo != null
        ? [
            prisma.product.updateMany({
              where: { categoryId: id },
              data: { categoryId: moveTo },
            }),
          ]
        : []),
      prisma.category.delete({ where: { id } }),
    ]);
    revalidateCatalog();
    return NextResponse.json({ ok: true, movedProducts: moveTo != null ? productCount : 0 });
  } catch {
    return NextResponse.json({ ok: false, error: "Kategori silinemedi." }, { status: 500 });
  }
}
