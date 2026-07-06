import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";

const ACTIONS = ["activate", "deactivate", "delete"] as const;
type BulkAction = (typeof ACTIONS)[number];

/** Toplu ürün işlemi: aktifleştir / pasifleştir / sil. Body: { action, ids }. */
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
  const action = ACTIONS.includes(b.action as BulkAction) ? (b.action as BulkAction) : null;
  const ids = Array.isArray(b.ids)
    ? b.ids.filter((x): x is number => Number.isInteger(x) && (x as number) > 0)
    : [];

  if (!action || ids.length === 0) {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  try {
    let count = 0;
    if (action === "delete") {
      const res = await prisma.product.deleteMany({ where: { id: { in: ids } } });
      count = res.count;
    } else {
      const res = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { isActive: action === "activate" },
      });
      count = res.count;
    }
    revalidateCatalog();
    return NextResponse.json({ ok: true, count });
  } catch {
    return NextResponse.json({ ok: false, error: "İşlem tamamlanamadı." }, { status: 500 });
  }
}
