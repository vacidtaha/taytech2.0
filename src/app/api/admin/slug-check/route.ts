import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/session";

export const runtime = "nodejs";

/**
 * Canlı slug uygunluk kontrolü.
 * GET /api/admin/slug-check?type=product|category&slug=...&excludeId=...
 * → { ok: true, available: boolean }
 */
export async function GET(req: NextRequest) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const slug = (searchParams.get("slug") ?? "").trim();
  const excludeRaw = searchParams.get("excludeId");
  const excludeId = excludeRaw ? Number(excludeRaw) : null;

  if ((type !== "product" && type !== "category") || !slug) {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const where = {
    slug,
    ...(excludeId && Number.isInteger(excludeId) ? { NOT: { id: excludeId } } : {}),
  };

  const clash =
    type === "product"
      ? await prisma.product.findFirst({ where, select: { id: true } })
      : await prisma.category.findFirst({ where, select: { id: true } });

  return NextResponse.json({ ok: true, available: !clash });
}
