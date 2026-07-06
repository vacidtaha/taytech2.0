import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { parseCategoryCreate } from "@/lib/category-input";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";

/** Yeni kategori oluştur. */
export async function POST(req: NextRequest) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz gövde." }, { status: 400 });
  }

  const parsed = parseCategoryCreate(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }
  const input = parsed.data;

  const clash = await prisma.category.findUnique({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json(
      { ok: false, error: `"${input.slug}" slug'ı zaten kullanılıyor.` },
      { status: 409 }
    );
  }

  if (input.parentId != null) {
    const parent = await prisma.category.findUnique({
      where: { id: input.parentId },
      select: { id: true },
    });
    if (!parent) {
      return NextResponse.json({ ok: false, error: "Üst kategori bulunamadı." }, { status: 400 });
    }
  }

  // Yeni kategori kardeşlerinin sonuna
  const last = await prisma.category.aggregate({
    where: { parentId: input.parentId },
    _max: { order: true },
  });
  const order = (last._max.order ?? -1) + 1;

  try {
    const created = await prisma.category.create({
      data: {
        nameTr: input.nameTr,
        nameEn: input.nameEn,
        slug: input.slug,
        parentId: input.parentId,
        order,
      },
      select: { id: true, slug: true },
    });
    revalidateCatalog();
    return NextResponse.json({ ok: true, category: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Kategori oluşturulamadı." }, { status: 500 });
  }
}
