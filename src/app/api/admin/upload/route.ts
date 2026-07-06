import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { requireApiSession } from "@/lib/session";
import { slugify } from "@/lib/product-input";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

// uzantı → izinli MIME (basit doğrulama; hem resim hem PDF)
const ALLOWED: Record<string, string[]> = {
  webp: ["image/webp"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  gif: ["image/gif"],
  avif: ["image/avif"],
  svg: ["image/svg+xml"],
  pdf: ["application/pdf"],
};

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export async function POST(req: NextRequest) {
  const gate = await requireApiSession();
  if (gate instanceof NextResponse) return gate;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz form verisi." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Dosya bulunamadı." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: "Boş dosya." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Dosya çok büyük (en fazla 30 MB)." },
      { status: 400 }
    );
  }

  const ext = extOf(file.name);
  const allowedMimes = ALLOWED[ext];
  if (!allowedMimes) {
    return NextResponse.json(
      { ok: false, error: "Desteklenmeyen dosya türü. (resim veya PDF)" },
      { status: 400 }
    );
  }
  // Uzantı beyaz listesi asıl korumadır (dosyalar statik sunulur, çalıştırılmaz).
  // MIME yalnızca danışma amaçlı: tarayıcı/istemci bazen webp/avif için jenerik
  // "application/octet-stream" gönderir. Sadece AÇIKÇA çelişen bir tür varsa engelle
  // (ör. .pdf yüklenirken içerik image/*, ya da tersi).
  const wantsPdf = ext === "pdf";
  if (file.type) {
    const isImageMime = file.type.startsWith("image/");
    const isPdfMime = file.type === "application/pdf";
    if ((wantsPdf && isImageMime) || (!wantsPdf && isPdfMime)) {
      return NextResponse.json(
        { ok: false, error: "Dosya içeriği uzantıyla uyuşmuyor." },
        { status: 400 }
      );
    }
  }

  const base = slugify(file.name.slice(0, file.name.length - ext.length - 1)) || "dosya";
  const suffix = randomBytes(4).toString("hex");
  const filename = `${base}-${suffix}.${ext}`;

  try {
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  } catch {
    return NextResponse.json({ ok: false, error: "Dosya kaydedilemedi." }, { status: 500 });
  }

  const url = `/uploads/${filename}`;
  return NextResponse.json({ ok: true, url, name: file.name, isImage: ext !== "pdf" });
}
