import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";

/**
 * Atomik sıralama: verilen id listesinin sırasına göre order = index yazar.
 * İki ayrı PATCH'in yarıda kalıp sıra bozması riskini ortadan kaldırır.
 *
 * Body: { type: "product" | "category", ids: number[] }
 * Kategorilerde ids aynı üst kategorinin kardeşleri olmalıdır (UI öyle gönderir).
 */
export async function POST(req: NextRequest) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz gövde." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const type = b.type === "product" || b.type === "category" ? b.type : null;
  const ids = Array.isArray(b.ids)
    ? b.ids.filter((x): x is number => Number.isInteger(x) && (x as number) > 0)
    : [];

  if (!type || ids.length === 0 || ids.length !== (b.ids as unknown[]).length) {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ ok: false, error: "Tekrarlı kimlik var." }, { status: 400 });
  }

  try {
    if (type === "product") {
      await prisma.$transaction(
        ids.map((id, i) =>
          prisma.product.update({ where: { id }, data: { order: i } })
        )
      );
    } else {
      await prisma.$transaction(
        ids.map((id, i) =>
          prisma.category.update({ where: { id }, data: { order: i } })
        )
      );
    }
    revalidateCatalog();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Sıralama kaydedilemedi (kayıt bulunamadı)." },
      { status: 400 }
    );
  }
}
