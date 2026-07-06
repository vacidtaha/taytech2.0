import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { parseProductInput, toPrismaData } from "@/lib/product-input";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";

/** Yeni ürün oluştur. */
export async function POST(req: NextRequest) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

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

  // Slug benzersiz mi?
  const clash = await prisma.product.findUnique({ where: { slug: input.slug }, select: { id: true } });
  if (clash) {
    return NextResponse.json(
      { ok: false, error: `"${input.slug}" slug'ı zaten kullanılıyor.` },
      { status: 409 }
    );
  }

  // Kategori gerçekten var mı?
  if (input.categoryId != null) {
    const cat = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!cat) {
      return NextResponse.json({ ok: false, error: "Kategori bulunamadı." }, { status: 400 });
    }
  }

  // Yeni ürün en sona
  const last = await prisma.product.aggregate({ _max: { order: true } });
  const order = (last._max.order ?? -1) + 1;

  try {
    const created = await prisma.product.create({
      data: {
        ...toPrismaData(input),
        order,
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
      select: { id: true, slug: true },
    });
    revalidateCatalog();
    return NextResponse.json({ ok: true, product: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Ürün oluşturulamadı." }, { status: 500 });
  }
}
