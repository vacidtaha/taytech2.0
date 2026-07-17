import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";

/** Ürünü tüm alanları ve dokümanlarıyla kopyalar. Kopya pasif başlar. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ ok: false, error: "Geçersiz kimlik." }, { status: 400 });
  }

  const src = await prisma.product.findUnique({
    where: { id },
    include: { documents: { orderBy: { order: "asc" } } },
  });
  if (!src) {
    return NextResponse.json({ ok: false, error: "Ürün bulunamadı." }, { status: 404 });
  }

  // Benzersiz "-kopya", "-kopya-2", ... slug'ı bul
  let slug = `${src.slug}-kopya`;
  for (let n = 2; await prisma.product.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${src.slug}-kopya-${n}`;
  }

  const last = await prisma.product.aggregate({ _max: { order: true } });

  try {
    const created = await prisma.product.create({
      data: {
        slug,
        order: (last._max.order ?? -1) + 1,
        isActive: false, // yanlışlıkla yayına çıkmasın
        nameTr: `${src.nameTr} (Kopya)`,
        nameEn: `${src.nameEn} (Copy)`,
        descTr: src.descTr,
        descEn: src.descEn,
        featuresTr: src.featuresTr,
        featuresEn: src.featuresEn,
        mainImageTr: src.mainImageTr,
        mainImageEn: src.mainImageEn,
        appImageTr: src.appImageTr,
        appImageEn: src.appImageEn,
        specTable: src.specTable,
        gallery: src.gallery,
        categoryId: src.categoryId,
        documents: {
          create: src.documents.map((d) => ({
            type: d.type,
            nameTr: d.nameTr,
            nameEn: d.nameEn,
            url: d.url,
            urlEn: d.urlEn,
            order: d.order,
          })),
        },
      },
      select: { id: true, slug: true },
    });
    revalidateCatalog();
    return NextResponse.json({ ok: true, product: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Kopyalanamadı." }, { status: 500 });
  }
}
