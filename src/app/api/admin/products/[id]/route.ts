import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { parseProductInput, toPrismaData } from "@/lib/product-input";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Tam güncelleme — tüm ürün alanları, galeri, teknik tablolar ve dokümanlar. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  const { id: idRaw } = await params;
  const id = parseId(idRaw);
  if (!id) return NextResponse.json({ ok: false, error: "Geçersiz kimlik." }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Ürün bulunamadı." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz gövde." }, { status: 400 });
  }

  const parsed = parseProductInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const input = parsed.data;

  // Slug başka bir ürüne ait mi?
  const clash = await prisma.product.findFirst({
    where: { slug: input.slug, NOT: { id } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { ok: false, error: `"${input.slug}" slug'ı başka bir üründe kullanılıyor.` },
      { status: 409 }
    );
  }

  if (input.categoryId != null) {
    const cat = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!cat) {
      return NextResponse.json({ ok: false, error: "Kategori bulunamadı." }, { status: 400 });
    }
  }

  try {
    // Dokümanları tamamen yeniden yaz (basit ve tutarlı).
    await prisma.$transaction([
      prisma.document.deleteMany({ where: { productId: id } }),
      prisma.product.update({
        where: { id },
        data: {
          ...toPrismaData(input),
          documents: {
            create: input.documents.map((d, i) => ({
              type: d.type,
              nameTr: d.nameTr,
              nameEn: d.nameEn,
              url: d.url,
              urlEn: d.urlEn,
              order: i,
            })),
          },
        },
      }),
    ]);
    revalidateCatalog();
    return NextResponse.json({ ok: true, product: { id, slug: input.slug } });
  } catch {
    return NextResponse.json({ ok: false, error: "Ürün güncellenemedi." }, { status: 500 });
  }
}

/** Kısmi güncelleme — şimdilik aktiflik ve sıra (tam düzenleme B3'te). */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  const { id: idRaw } = await params;
  const id = parseId(idRaw);
  if (!id) return NextResponse.json({ ok: false, error: "Geçersiz kimlik." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz gövde." }, { status: 400 });
  }

  const data: { isActive?: boolean; order?: number } = {};
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (typeof b.isActive === "boolean") data.isActive = b.isActive;
    if (typeof b.order === "number" && Number.isFinite(b.order)) data.order = b.order;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: false, error: "Güncellenecek alan yok." }, { status: 400 });
  }

  try {
    const updated = await prisma.product.update({ where: { id }, data });
    revalidateCatalog();
    return NextResponse.json({ ok: true, product: { id: updated.id, isActive: updated.isActive, order: updated.order } });
  } catch {
    return NextResponse.json({ ok: false, error: "Ürün bulunamadı." }, { status: 404 });
  }
}

/** Ürünü sil (dokümanları şema gereği birlikte silinir). */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  const { id: idRaw } = await params;
  const id = parseId(idRaw);
  if (!id) return NextResponse.json({ ok: false, error: "Geçersiz kimlik." }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Ürün bulunamadı." }, { status: 404 });
  }
}
