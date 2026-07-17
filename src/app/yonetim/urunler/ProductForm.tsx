"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Check,
  FileText,
  AlertCircle,
  Columns3,
  Rows3,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderTree,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ClipboardPaste,
  List,
  Pilcrow,
} from "lucide-react";
import { slugify, DOCUMENT_TYPES } from "@/lib/product-input";
import type { AdminCategory } from "@/lib/catalog";

/* --------------------------------- Tipler --------------------------------- */

type SpecTable = {
  name: string;
  nameEn: string;
  data: string[][];
  dataEn: string[][];
};
type GalleryItem = { url: string; urlEn: string };
type DocItem = {
  type: string;
  nameTr: string;
  nameEn: string;
  url: string;
  urlEn: string;
};

/**
 * Açıklama, admin için yapılandırılmış bölümler halinde düzenlenir
 * (paragraf / özellik listesi + opsiyonel ara başlık). Veritabanına yine tek
 * metin olarak yazılır; sitedeki görünüm kurallarını admin'in bilmesi gerekmez.
 */
type DescSection = {
  title: string;
  kind: "paragraph" | "bullets";
  text: string; // bullets: her satır bir madde
};

type FormState = {
  slug: string;
  isActive: boolean;
  nameTr: string;
  nameEn: string;
  descTr: DescSection[];
  descEn: DescSection[];
  /** Teknik özellikler: satır başına bir madde; ";"/":" ile biten satır grup
   * başlığı, tab (veya baştaki "-") ile başlayan satır alt maddedir. */
  featuresTr: string;
  featuresEn: string;
  categoryId: number | null;
  mainImageTr: string;
  mainImageEn: string;
  appImageTr: string;
  appImageEn: string;
  specTables: SpecTable[];
  gallery: GalleryItem[];
  documents: DocItem[];
};

/** Sunucudan gelen düzenleme verisi (açıklamalar ham metin). */
type ProductEditData = Omit<FormState, "descTr" | "descEn"> & {
  id: number;
  descTr: string;
  descEn: string;
};

const EMPTY_SECTION: DescSection = { title: "", kind: "paragraph", text: "" };

/** Kayıtlı ham açıklamayı bölümlere ayırır (site ayrıştırıcısıyla aynı kurallar). */
function parseDescToSections(text: string): DescSection[] {
  const isHeading = (line: string) =>
    /[a-zçğıöşü]/i.test(line) &&
    line === line.toLocaleUpperCase("tr-TR") &&
    !line.includes(":") &&
    line.length <= 60;

  const sections: DescSection[] = [];
  let cur: DescSection | null = null;

  const push = () => {
    if (cur && (cur.title || cur.text.trim())) sections.push(cur);
    cur = null;
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (isHeading(line)) {
      push();
      cur = { title: line, kind: "paragraph", text: "" };
      continue;
    }

    const isBullet = line.startsWith("•") || line.startsWith("-");
    const content = isBullet ? line.replace(/^[•-]\s*/, "") : line;

    if (!cur) {
      cur = { title: "", kind: isBullet ? "bullets" : "paragraph", text: "" };
    } else if (cur.text.trim() === "") {
      // Başlık atıldı ama içerik henüz yok — türü ilk içerik belirler
      cur.kind = isBullet ? "bullets" : "paragraph";
    } else if ((cur.kind === "bullets") !== isBullet) {
      // Tür değişti → yeni bölüm
      push();
      cur = { title: "", kind: isBullet ? "bullets" : "paragraph", text: "" };
    }
    cur.text = cur.text ? `${cur.text}\n${content}` : content;
  }
  push();

  return sections.length ? sections : [{ ...EMPTY_SECTION }];
}

/** Bölümleri veritabanı/site formatındaki tek metne çevirir. */
function serializeSections(sections: DescSection[]): string {
  const parts: string[] = [];
  for (const s of sections) {
    const lines: string[] = [];
    const title = s.title.trim();
    if (title) lines.push(title.toLocaleUpperCase("tr-TR"));
    const body = s.text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!title && !body.length) continue;
    if (s.kind === "bullets") {
      for (const b of body) lines.push(`• ${b}`);
    } else {
      lines.push(...body);
    }
    parts.push(lines.join("\n"));
  }
  return parts.join("\n\n");
}

type Props =
  | { mode: "create"; categories: AdminCategory[]; product?: undefined }
  | { mode: "edit"; categories: AdminCategory[]; product: ProductEditData };

/** categoryId için tam yol etiketi ("Ana / Alt / Alt2"). */
function categoryPath(id: number | null, cats: AdminCategory[]): string {
  if (id == null) return "";
  const byId = new Map(cats.map((c) => [c.id, c]));
  const parts: string[] = [];
  let cur = byId.get(id);
  let guard = 0;
  while (cur && guard++ < 50) {
    parts.unshift(cur.nameTr);
    cur = cur.parentId != null ? byId.get(cur.parentId) : undefined;
  }
  return parts.join(" / ");
}

const DOC_TYPE_LABELS: Record<string, string> = {
  katalog: "Katalog",
  teknik: "Teknik Doküman",
  kilavuz: "Kullanım Kılavuzu",
  sertifika: "Sertifika (CE)",
  cad: "CAD / Çizim",
};

/* ------------------------------ Yükleme yardımcısı ------------------------ */

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024; // sunucuyla aynı sınır
const IMAGE_EXTS = ["webp", "png", "jpg", "jpeg", "gif", "avif", "svg"];

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/** Sunucuya gitmeden hızlı ön kontrol: boyut + uzantı. Hata mesajı ya da null döner. */
function preflightFile(file: File, kind: "image" | "pdf"): string | null {
  if (file.size === 0) return "Dosya boş.";
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return `Dosya çok büyük (${mb} MB). En fazla 30 MB yüklenebilir.`;
  }
  const ext = extOf(file.name);
  if (kind === "pdf" && ext !== "pdf") return "Buraya yalnızca PDF yüklenebilir.";
  if (kind === "image" && !IMAGE_EXTS.includes(ext)) {
    return `Desteklenmeyen görsel türü (.${ext}). İzinli: ${IMAGE_EXTS.join(", ")}`;
  }
  return null;
}

/** XHR ile yükleme — ilerleme yüzdesi bildirir; 401'de özel hata fırlatır. */
function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; isImage: boolean }> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onerror = () => reject(new Error("Sunucuya ulaşılamadı."));
    xhr.onload = () => {
      let json: { ok?: boolean; url?: string; isImage?: boolean; error?: string } = {};
      try {
        json = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status === 401) {
        reject(new Error("Oturumunuz sona erdi. Yeni sekmede giriş yapıp tekrar deneyin."));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300 || !json.ok || !json.url) {
        reject(new Error(json.error || "Yükleme başarısız."));
        return;
      }
      resolve({ url: json.url, isImage: Boolean(json.isImage) });
    };
    xhr.send(fd);
  });
}

/* -------------------------------- Alt bileşenler -------------------------- */

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-7">
      <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">{title}</h2>
      {desc && <p className="mt-1 text-[13px] text-[#86868b]">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-[#424245]">
        {label}
        {hint && <span className="font-normal text-[#a1a1a6]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#1d1d1f] outline-none transition-colors placeholder:text-[#c4c4c4] focus:border-[#dc2626]";

/** Tek görsel / PDF yükleme yuvası. */
function UploadSlot({
  value,
  onChange,
  kind,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  kind: "image" | "pdf";
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const accept = kind === "image" ? "image/*" : "application/pdf";

  async function handleFile(file: File) {
    setErr(null);
    // Sunucuya gitmeden boyut/uzantı ön kontrolü — zaman kaybını önler.
    const preflight = preflightFile(file, kind);
    if (preflight) {
      setErr(preflight);
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const { url } = await uploadFile(file, setProgress);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-[#424245]">{label}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="relative flex items-center gap-3 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-2.5">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg bg-white object-contain"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-[#dc2626]">
              <FileText size={22} />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-[13px] text-[#424245]">
            {value.split("/").pop()}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#0071e3] transition-colors hover:bg-[#f0f0f0]"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : "Değiştir"}
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] transition-colors hover:bg-[#fee2e2] hover:text-[#dc2626]"
              aria-label="Kaldır"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d2d2d7] bg-[#fafafa] px-4 py-5 text-[13px] font-medium text-[#86868b] transition-colors hover:border-[#dc2626] hover:text-[#dc2626] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Yükleniyor… %{progress}
            </>
          ) : (
            <>
              <Upload size={16} /> {kind === "image" ? "Görsel yükle" : "PDF yükle"}
            </>
          )}
        </button>
      )}
      {err && (
        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#dc2626]">
          <AlertCircle size={13} /> {err}
        </p>
      )}
    </div>
  );
}

/* ------------------------- Tablo içe aktarma (CSV) ------------------------ */

/**
 * Yapıştırılan metni tabloya çevirir.
 * Excel/Numbers kopyaları sekmeli gelir; ayrıca ; ve , ayraçlı CSV desteklenir
 * (tırnaklı hücreler dahil). Ayraç ilk satırdan otomatik seçilir.
 */
function parsePastedTable(text: string): string[][] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim().length);
  if (!lines.length) return [];

  const first = lines[0];
  const delim =
    first.includes("\t") ? "\t" : first.includes(";") ? ";" : ",";

  const parseLine = (line: string): string[] => {
    if (delim === "\t") return line.split("\t").map((c) => c.trim());
    // Tırnak destekli CSV ayrıştırma
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === delim) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const rows = lines.map(parseLine);
  // Tüm satırları en geniş satıra eşitle (eksik hücreler boş kalır)
  const width = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => (r.length < width ? [...r, ...Array(width - r.length).fill("")] : r));
}

function TableImportModal({
  onImport,
  onClose,
}: {
  onImport: (name: string, data: string[][]) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileErr, setFileErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const parsed = useMemo(() => parsePastedTable(raw), [raw]);

  function handleFile(file: File) {
    setFileErr(null);
    const ext = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
    if (!["csv", "tsv", "txt"].includes(ext)) {
      setFileErr(
        ext === "xlsx" || ext === "xls"
          ? "Excel dosyasını doğrudan okuyamıyorum — Excel'de “Farklı Kaydet → CSV UTF-8” ile kaydedin ya da hücreleri kopyalayıp aşağıya yapıştırın."
          : "Yalnızca .csv, .tsv veya .txt dosyası seçin."
      );
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileErr("Dosya çok büyük (en fazla 2 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setFileErr("Dosya okunamadı.");
    reader.onload = () => {
      const text = String(reader.result ?? "");
      if (!text.trim()) {
        setFileErr("Dosya boş görünüyor.");
        return;
      }
      setRaw(text);
      setFileName(file.name);
      if (!name) {
        // Dosya adından makul bir başlık öner (uzantısız)
        setName(file.name.replace(/\.(csv|tsv|txt)$/i, ""));
      }
    };
    reader.readAsText(file); // UTF-8
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#1d1d1f]">
              Tabloyu İçe Aktar
            </h3>
            <p className="mt-0.5 text-[13px] text-[#86868b]">
              CSV dosyası seçin ya da Excel/Numbers&apos;tan kopyalayıp yapıştırın.
              İlk satır başlık kabul edilir; ekledikten sonra hücreleri düzenleyebilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#f5f5f7]"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dosya seçimi */}
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d2d2d7] bg-[#fafafa] px-4 py-4 text-[13px] font-medium text-[#86868b] transition-colors hover:border-[#dc2626] hover:text-[#dc2626]"
        >
          <Upload size={15} />
          {fileName ? `${fileName} — başka dosya seç` : "CSV dosyası seç (.csv / .tsv / .txt)"}
        </button>
        {fileErr && (
          <p className="mb-3 flex items-start gap-1.5 text-[12px] leading-snug text-[#dc2626]">
            <AlertCircle size={13} className="mt-0.5 shrink-0" /> {fileErr}
          </p>
        )}

        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tablo başlığı (örn. Teknik Özellikler) — opsiyonel"
        />

        <textarea
          className={`${inputCls} mt-3 min-h-[140px] resize-y font-mono text-[13px] leading-relaxed`}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setFileName(null); // elle değiştirildi — artık dosya içeriği değil
          }}
          placeholder={"Model\tGüç\tVoltaj\nSB-100\t1 kW\t220V\nSB-200\t2 kW\t380V"}
        />

        {/* Canlı önizleme */}
        {parsed.length > 0 && (
          <div className="mt-4 min-h-0 overflow-auto rounded-xl border border-[#e5e5e5]">
            <table className="w-full text-[13px]">
              <tbody>
                {parsed.slice(0, 8).map((row, r) => (
                  <tr key={r} className={r === 0 ? "bg-[#fafafa]" : ""}>
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`border-b border-r border-[#f0f0f0] px-2.5 py-1.5 last:border-r-0 ${
                          r === 0 ? "font-semibold text-[#1d1d1f]" : "text-[#424245]"
                        }`}
                      >
                        {cell || <span className="text-[#d2d2d7]">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-2.5 py-1.5 text-[12px] text-[#a1a1a6]">
              {parsed.length} satır × {parsed[0]?.length ?? 0} sütun
              {parsed.length > 8 ? " (ilk 8 satır gösteriliyor)" : ""}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => onImport(name.trim(), parsed)}
            disabled={parsed.length === 0}
            className="rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-50"
          >
            Tabloyu Ekle
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Açıklama önizleme --------------------------- */

/**
 * Sitedeki ürün detayının ayrıştırma kurallarının aynısı:
 * "•" ile başlayan satır → madde, TAMAMEN BÜYÜK kısa satır → başlık,
 * "|" içeren satır → yan yana spec parçaları, diğerleri paragraf.
 */
function DescPreview({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="ml-1 space-y-1.5 border-l-2 border-[#e8e8ed] pl-4">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  const isHeading = (line: string) =>
    /[a-zçğıöşü]/i.test(line) &&
    line === line.toLocaleUpperCase("tr-TR") &&
    !line.includes(":") &&
    line.length <= 60;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushBullets();
      continue;
    }
    if (line.startsWith("•") || line.startsWith("-")) {
      bullets.push(line.replace(/^[•-]\s*/, ""));
      continue;
    }
    flushBullets();
    if (isHeading(line)) {
      blocks.push(
        <h4
          key={`h-${blocks.length}`}
          className="pt-2 text-[12px] font-semibold uppercase tracking-wide text-[#1d1d1f]"
        >
          {line}
        </h4>
      );
    } else if (line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim()).filter(Boolean);
      blocks.push(
        <div key={`s-${blocks.length}`} className="flex flex-wrap gap-x-4 gap-y-1">
          {parts.map((p, i) => (
            <span key={i}>{p}</span>
          ))}
        </div>
      );
    } else {
      blocks.push(<p key={`p-${blocks.length}`}>{line}</p>);
    }
  }
  flushBullets();

  return (
    <div className="mt-2 space-y-2.5 rounded-xl border border-dashed border-[#d2d2d7] bg-[#fafafa] px-4 py-3 text-[13px] leading-relaxed text-[#424245]">
      {blocks.length ? blocks : <p className="text-[#a1a1a6]">Önizleme burada görünecek…</p>}
    </div>
  );
}

/* --------------------------------- Form ----------------------------------- */

export default function ProductForm(props: Props) {
  const { mode, categories } = props;
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() =>
    props.mode === "edit"
      ? {
          slug: props.product.slug,
          isActive: props.product.isActive,
          nameTr: props.product.nameTr,
          nameEn: props.product.nameEn,
          descTr: parseDescToSections(props.product.descTr),
          descEn: parseDescToSections(props.product.descEn),
          featuresTr: props.product.featuresTr,
          featuresEn: props.product.featuresEn,
          categoryId: props.product.categoryId,
          mainImageTr: props.product.mainImageTr,
          mainImageEn: props.product.mainImageEn,
          appImageTr: props.product.appImageTr,
          appImageEn: props.product.appImageEn,
          specTables: props.product.specTables.map((t) => ({
            name: t.name,
            nameEn: t.nameEn ?? "",
            data: t.data.map((r) => [...r]),
            dataEn: (t.dataEn ?? []).map((r) => [...r]),
          })),
          gallery: props.product.gallery.map((g) => ({ url: g.url, urlEn: g.urlEn })),
          documents: props.product.documents.map((d) => ({ ...d })),
        }
      : {
          slug: "",
          isActive: true,
          nameTr: "",
          nameEn: "",
          descTr: [{ ...EMPTY_SECTION }],
          descEn: [{ ...EMPTY_SECTION }],
          featuresTr: "",
          featuresEn: "",
          categoryId: null,
          mainImageTr: "",
          mainImageEn: "",
          appImageTr: "",
          appImageEn: "",
          specTables: [],
          gallery: [],
          documents: [],
        }
  );

  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showNoCatConfirm, setShowNoCatConfirm] = useState<null | { stay: boolean }>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  const effectiveSlug = slugTouched ? form.slug : slugify(form.nameTr);

  /* --------------------- Kaydedilmemiş değişiklik takibi ------------------- */
  const [snapshot, setSnapshot] = useState(() => JSON.stringify(form));
  const isDirty = JSON.stringify(form) !== snapshot;

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  function goBack() {
    if (isDirty) setShowLeaveConfirm(true);
    else router.push("/yonetim/urunler");
  }

  /* ------------------------- Canlı slug uygunluğu ------------------------- */
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const savedSlug = mode === "edit" ? props.product.slug : null;

  useEffect(() => {
    const s = slugify(effectiveSlug);
    if (!s || s === savedSlug) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ type: "product", slug: s });
        if (mode === "edit") params.set("excludeId", String(props.product.id));
        const res = await fetch(`/api/admin/slug-check?${params}`, {
          signal: ctrl.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (json.ok) setSlugStatus(json.available ? "available" : "taken");
        else setSlugStatus("idle");
      } catch {
        /* iptal ya da ağ hatası — sessiz geç */
      }
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSlug, savedSlug]);

  /* ----------------------------- Önizleme aç/kapa -------------------------- */
  const [showPreview, setShowPreview] = useState(false);
  const [showTableImport, setShowTableImport] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  /* --------------------------- Açıklama bölümleri ------------------------- */
  const addSection = (lang: "descTr" | "descEn", kind: DescSection["kind"]) =>
    set(lang, [...form[lang], { title: "", kind, text: "" }]);
  const updateSection = (
    lang: "descTr" | "descEn",
    i: number,
    patch: Partial<DescSection>
  ) =>
    set(lang, form[lang].map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const removeSection = (lang: "descTr" | "descEn", i: number) =>
    set(lang, form[lang].filter((_, idx) => idx !== i));
  const moveSection = (lang: "descTr" | "descEn", i: number, dir: -1 | 1) => {
    const next = form[lang].map((s) => ({ ...s }));
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set(lang, next);
  };

  /* ------------------------------ Galeri işlemleri ------------------------ */
  const addGallery = () => set("gallery", [...form.gallery, { url: "", urlEn: "" }]);
  const updateGallery = (i: number, patch: Partial<GalleryItem>) =>
    set(
      "gallery",
      form.gallery.map((g, idx) => (idx === i ? { ...g, ...patch } : g))
    );
  const removeGallery = (i: number) =>
    set("gallery", form.gallery.filter((_, idx) => idx !== i));
  const moveGallery = (i: number, dir: -1 | 1) => {
    const next = [...form.gallery];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("gallery", next);
  };

  /* ---------------------------- Doküman işlemleri ------------------------- */
  const addDoc = () =>
    set("documents", [
      ...form.documents,
      { type: "teknik", nameTr: "", nameEn: "", url: "", urlEn: "" },
    ]);
  const updateDoc = (i: number, patch: Partial<DocItem>) =>
    set(
      "documents",
      form.documents.map((d, idx) => (idx === i ? { ...d, ...patch } : d))
    );
  const removeDoc = (i: number) =>
    set("documents", form.documents.filter((_, idx) => idx !== i));
  const moveDoc = (i: number, dir: -1 | 1) => {
    const next = [...form.documents];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("documents", next);
  };

  /* ------------------------- Teknik tablo işlemleri ----------------------- */
  // Her tablo için aktif düzenleme dili (yalnızca arayüz durumu, kaydedilmez)
  const [tableLangs, setTableLangs] = useState<Record<number, "tr" | "en">>({});
  const langOf = (ti: number): "tr" | "en" => tableLangs[ti] ?? "tr";
  const setTableLang = (ti: number, lang: "tr" | "en") =>
    setTableLangs((prev) => ({ ...prev, [ti]: lang }));
  const gridKeyOf = (ti: number): "data" | "dataEn" =>
    langOf(ti) === "en" ? "dataEn" : "data";

  const cloneTable = (t: SpecTable): SpecTable => ({
    name: t.name,
    nameEn: t.nameEn,
    data: t.data.map((r) => [...r]),
    dataEn: t.dataEn.map((r) => [...r]),
  });

  const addTable = () =>
    set("specTables", [
      ...form.specTables,
      { name: "", nameEn: "", data: [["Özellik", "Değer"], ["", ""]], dataEn: [] },
    ]);
  const updateTable = (ti: number, patch: Partial<SpecTable>) =>
    set(
      "specTables",
      form.specTables.map((t, idx) => (idx === ti ? { ...t, ...patch } : t))
    );
  const removeTable = (ti: number) =>
    set("specTables", form.specTables.filter((_, idx) => idx !== ti));
  const moveTable = (ti: number, dir: -1 | 1) => {
    const next = form.specTables.map(cloneTable);
    const j = ti + dir;
    if (j < 0 || j >= next.length) return;
    [next[ti], next[j]] = [next[j], next[ti]];
    set("specTables", next);
  };
  /** TR tablosunu İngilizce tarafına kopyalar (çeviri için başlangıç). */
  const copyTrToEn = (ti: number) => {
    const t = form.specTables[ti];
    updateTable(ti, {
      dataEn: t.data.map((r) => [...r]),
      nameEn: t.nameEn || t.name,
    });
  };
  /** Veri satırlarını taşır (başlık satırı r=0 yerinde kalır). */
  const moveRow = (ti: number, r: number, dir: -1 | 1) => {
    const key = gridKeyOf(ti);
    const grid = form.specTables[ti][key];
    const j = r + dir;
    if (r === 0 || j <= 0 || j >= grid.length) return;
    const data = grid.map((row) => [...row]);
    [data[r], data[j]] = [data[j], data[r]];
    updateTable(ti, { [key]: data } as Partial<SpecTable>);
  };

  const setCell = (ti: number, r: number, c: number, val: string) => {
    const key = gridKeyOf(ti);
    const data = form.specTables[ti][key].map((row) => [...row]);
    data[r][c] = val;
    updateTable(ti, { [key]: data } as Partial<SpecTable>);
  };
  const addRow = (ti: number) => {
    const key = gridKeyOf(ti);
    const grid = form.specTables[ti][key];
    const cols = grid[0]?.length ?? 2;
    updateTable(ti, {
      [key]: [...grid.map((r) => [...r]), Array(cols).fill("")],
    } as Partial<SpecTable>);
  };
  const removeRow = (ti: number, r: number) => {
    const key = gridKeyOf(ti);
    const grid = form.specTables[ti][key];
    if (grid.length <= 1) return;
    updateTable(ti, { [key]: grid.filter((_, idx) => idx !== r) } as Partial<SpecTable>);
  };
  const addCol = (ti: number) => {
    const key = gridKeyOf(ti);
    const grid = form.specTables[ti][key];
    updateTable(ti, { [key]: grid.map((row) => [...row, ""]) } as Partial<SpecTable>);
  };
  const removeCol = (ti: number, c: number) => {
    const key = gridKeyOf(ti);
    const grid = form.specTables[ti][key];
    if ((grid[0]?.length ?? 0) <= 1) return;
    updateTable(ti, {
      [key]: grid.map((row) => row.filter((_, idx) => idx !== c)),
    } as Partial<SpecTable>);
  };

  /* --------------------------------- Kaydet ------------------------------- */

  /** Kaydetmeden önce tüm mantık kontrolleri; hata mesajı ya da null döner. */
  function validate(): string | null {
    if (!form.nameTr.trim()) return "Türkçe ürün adı zorunludur.";
    if (!form.nameEn.trim()) return "İngilizce ürün adı zorunludur.";

    const finalSlug = slugify(effectiveSlug);
    if (!finalSlug) return "Geçerli bir slug gerekli.";
    if (slugStatus === "taken") return `"${finalSlug}" slug'ı başka bir üründe kullanılıyor.`;

    // Yarım doldurulmuş dokümanların sessizce kaybolmasını engelle.
    const incompleteDoc = form.documents.some((d) => {
      const hasAny = d.url || d.urlEn || d.nameTr.trim() || d.nameEn.trim();
      const complete = d.url && d.nameTr.trim();
      return hasAny && !complete;
    });
    if (incompleteDoc) {
      return "Her doküman için Türkçe ad ve TR dosyası gerekli. Eksik dokümanı tamamlayın ya da kaldırın.";
    }

    if (form.mainImageEn && !form.mainImageTr) {
      return "Ana görselin EN'i var ama TR'si yok. TR görseli de yükleyin.";
    }
    if (form.appImageEn && !form.appImageTr) {
      return "Uygulama görselinin EN'i var ama TR'si yok. TR görseli de yükleyin.";
    }

    // İçi dolu ama başlık satırı tamamen boş teknik tablo → sitede bozuk görünür.
    for (let i = 0; i < form.specTables.length; i++) {
      const t = form.specTables[i];
      for (const [gridLabel, grid] of [["", t.data], [" (EN)", t.dataEn]] as const) {
        const hasContent = grid.some((row) => row.some((c) => c.trim()));
        const headerEmpty = (grid[0] ?? []).every((c) => !c.trim());
        if (hasContent && headerEmpty) {
          return `Teknik tablo ${i + 1}${t.name ? ` (${t.name})` : ""}${gridLabel}: başlık satırı (ilk satır) boş. Başlıkları doldurun.`;
        }
      }
    }
    return null;
  }

  /**
   * stay=true → kayıttan sonra sayfada kal (düzenlemede) / formu sıfırla (yenide).
   * skipCatCheck → kategorisiz onayı verildiyse tekrar sorma.
   */
  async function handleSave(opts?: { stay?: boolean; skipCatCheck?: boolean }) {
    setError(null);

    const problem = validate();
    if (problem) return setError(problem);

    // Kategorisiz ürün menüde/kategori sayfalarında görünmez — bilinçli onay iste.
    if (form.categoryId == null && !opts?.skipCatCheck) {
      setShowNoCatConfirm({ stay: opts?.stay ?? false });
      return;
    }

    const finalSlug = slugify(effectiveSlug);
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: finalSlug,
        // Bölümler tek metne çevrilerek kaydedilir (API/DB formatı değişmedi)
        descTr: serializeSections(form.descTr),
        descEn: serializeSections(form.descEn),
      };
      const url =
        mode === "edit"
          ? `/api/admin/products/${props.product.id}`
          : "/api/admin/products";
      const res = await fetch(url, {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        // Yönlendirme YOK: girilen veri kaybolmasın.
        setError(
          "Oturumunuz sona erdi. Yeni bir sekmede giriş yapın, sonra buraya dönüp tekrar Kaydet'e basın — verileriniz duruyor."
        );
        setSaving(false);
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setError(json.error || "Kaydedilemedi.");
        setSaving(false);
        return;
      }

      if (opts?.stay) {
        if (mode === "create") {
          // Kaydet + yeni ekle: formu sıfırla
          const blank: FormState = {
            slug: "",
            isActive: true,
            nameTr: "",
            nameEn: "",
            descTr: [{ ...EMPTY_SECTION }],
            descEn: [{ ...EMPTY_SECTION }],
            featuresTr: "",
            featuresEn: "",
            categoryId: form.categoryId, // aynı kategoriye peş peşe eklemek yaygın
            mainImageTr: "",
            mainImageEn: "",
            appImageTr: "",
            appImageEn: "",
            specTables: [],
            gallery: [],
            documents: [],
          };
          setForm(blank);
          setSnapshot(JSON.stringify(blank));
          setSlugTouched(false);
          setSaving(false);
          showToast("Kaydedildi — yeni ürün ekleyebilirsiniz");
          window.scrollTo({ top: 0 });
          router.refresh();
        } else {
          // Kaydet ve kalmaya devam et
          setForm((f) => ({ ...f, slug: finalSlug }));
          setSnapshot(JSON.stringify({ ...form, slug: finalSlug }));
          setSaving(false);
          showToast("Kaydedildi");
          router.refresh();
        }
        return;
      }

      // Normal akış: listeye dön (snapshot güncelle ki beforeunload tetiklenmesin)
      setSnapshot(JSON.stringify(form));
      router.push("/yonetim/urunler");
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı.");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pb-24">
      {/* Üst çubuk */}
      <div className="sticky top-0 z-30 border-b border-[#e5e5e5] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#86868b] transition-colors hover:text-[#1d1d1f]"
          >
            <ArrowLeft size={18} /> Ürünler
          </button>
          <div className="flex items-center gap-3">
            {error && (
              <span className="hidden max-w-md items-center gap-1.5 text-[13px] font-medium text-[#dc2626] lg:flex">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </span>
            )}
            {isDirty && !saving && (
              <span className="hidden text-[13px] font-medium text-[#b45309] sm:block">
                Kaydedilmemiş değişiklikler
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSave({ stay: true })}
              disabled={saving || (mode === "edit" && !isDirty)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7] disabled:opacity-40"
              title={
                mode === "create"
                  ? "Kaydet ve aynı ekranda yeni ürün eklemeye başla"
                  : "Kaydet ve bu sayfada kalmaya devam et"
              }
            >
              {mode === "create" ? "Kaydet, Yeni Ekle" : "Kaydet, Kal"}
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving || (mode === "edit" && !isDirty)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Kaydediliyor…
                </>
              ) : (
                <>
                  <Check size={16} /> Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Başarı bildirimi */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl bg-[#1d1d1f] px-5 py-3 text-sm font-medium text-white shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#34c759]" /> {toast}
          </span>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight text-[#1d1d1f]">
          {mode === "edit" ? form.nameTr || "Ürünü Düzenle" : "Yeni Ürün"}
        </h1>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c] sm:hidden">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Temel bilgiler */}
          <Card title="Temel Bilgiler">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Ürün Adı (TR)">
                <input
                  className={inputCls}
                  value={form.nameTr}
                  onChange={(e) => set("nameTr", e.target.value)}
                  placeholder="örn. Smart Booster"
                  maxLength={100}
                />
                {form.nameTr.length >= 80 && (
                  <span className="mt-1 block text-right text-[11px] text-[#a1a1a6]">
                    {form.nameTr.length}/100
                  </span>
                )}
              </Field>
              <Field label="Ürün Adı (EN)">
                <input
                  className={inputCls}
                  value={form.nameEn}
                  onChange={(e) => set("nameEn", e.target.value)}
                  placeholder="e.g. Smart Booster"
                  maxLength={100}
                />
                {form.nameEn.length >= 80 && (
                  <span className="mt-1 block text-right text-[11px] text-[#a1a1a6]">
                    {form.nameEn.length}/100
                  </span>
                )}
              </Field>
              <Field label="Slug" hint="(URL adresi)">
                <div className="relative">
                  <input
                    className={`${inputCls} pr-9 ${
                      slugStatus === "taken" ? "border-[#dc2626]" : ""
                    }`}
                    value={effectiveSlug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value);
                    }}
                    onBlur={(e) => {
                      if (slugTouched) set("slug", slugify(e.target.value));
                    }}
                    placeholder="smart-booster"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {slugStatus === "checking" && (
                      <Loader2 size={15} className="animate-spin text-[#a1a1a6]" />
                    )}
                    {slugStatus === "available" && (
                      <CheckCircle2 size={15} className="text-[#34c759]" />
                    )}
                    {slugStatus === "taken" && (
                      <XCircle size={15} className="text-[#dc2626]" />
                    )}
                  </span>
                </div>
                {slugStatus === "taken" && (
                  <span className="mt-1 block text-[12px] text-[#dc2626]">
                    Bu slug başka bir üründe kullanılıyor.
                  </span>
                )}
              </Field>
              <Field label="Kategori">
                <button
                  type="button"
                  onClick={() => setShowCatPicker(true)}
                  className={`${inputCls} flex items-center justify-between gap-2 text-left`}
                >
                  <span
                    className={`truncate ${
                      form.categoryId != null ? "text-[#1d1d1f]" : "text-[#c4c4c4]"
                    }`}
                  >
                    {form.categoryId != null
                      ? categoryPath(form.categoryId, categories)
                      : "Kategori seç"}
                  </span>
                  <FolderTree size={16} className="shrink-0 text-[#86868b]" />
                </button>
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#fafafa] px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[#1d1d1f]">Yayında</p>
                <p className="text-[13px] text-[#86868b]">
                  Kapalıyken ürün sitede ve menüde görünmez.
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                aria-label="Yayın durumu"
                role="switch"
                aria-checked={form.isActive}
                className={`relative h-[26px] w-[46px] shrink-0 rounded-full p-0 transition-colors duration-200 ease-out ${
                  form.isActive ? "bg-[#34c759]" : "bg-[#d2d2d7]"
                }`}
              >
                <span
                  className={`absolute left-[3px] top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out ${
                    form.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </Card>

          {/* Açıklama — yapılandırılmış bölümler */}
          <Card
            title="Açıklama"
            desc="Bölümler halinde yazın: düz metin için “Paragraf”, madde işaretli liste için “Özellik Listesi”. Sitedeki tasarım otomatik uygulanır."
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[13px] font-medium text-[#424245] transition-colors hover:bg-[#f5f5f7]"
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? "Önizlemeyi gizle" : "Sitede nasıl görünecek?"}
              </button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {(["descTr", "descEn"] as const).map((lang) => (
                <div key={lang}>
                  <p className="mb-2 text-[13px] font-medium text-[#424245]">
                    {lang === "descTr" ? "Açıklama (TR)" : "Açıklama (EN)"}
                  </p>
                  <div className="space-y-3">
                    {form[lang].map((s, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3"
                      >
                        <div className="mb-2 flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${
                              s.kind === "bullets"
                                ? "bg-[#eef2ff] text-[#4f46e5]"
                                : "bg-[#f0f0f0] text-[#6e6e73]"
                            }`}
                          >
                            {s.kind === "bullets" ? (
                              <>
                                <List size={11} /> Özellik Listesi
                              </>
                            ) : (
                              <>
                                <Pilcrow size={11} /> Paragraf
                              </>
                            )}
                          </span>
                          <div className="ml-auto flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => moveSection(lang, i, -1)}
                              disabled={i === 0}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                              aria-label="Yukarı taşı"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(lang, i, 1)}
                              disabled={i === form[lang].length - 1}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                              aria-label="Aşağı taşı"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSection(lang, i)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#fee2e2] hover:text-[#dc2626]"
                              aria-label="Bölümü sil"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <input
                          className={`${inputCls} mb-2 text-[13px] font-semibold uppercase`}
                          value={s.title}
                          onChange={(e) => updateSection(lang, i, { title: e.target.value })}
                          placeholder={
                            s.kind === "bullets"
                              ? lang === "descTr"
                                ? "Ara başlık — örn. ÖZELLİKLER (opsiyonel)"
                                : "Ara başlık — örn. FEATURES (opsiyonel)"
                              : "Ara başlık (opsiyonel)"
                          }
                          maxLength={60}
                        />
                        <textarea
                          className={`${inputCls} min-h-[90px] resize-y text-[13px] leading-relaxed`}
                          value={s.text}
                          onChange={(e) => updateSection(lang, i, { text: e.target.value })}
                          placeholder={
                            s.kind === "bullets"
                              ? "Her satıra bir özellik yazın:\nPaslanmaz çelik gövde\nSessiz çalışma\nOtomatik koruma"
                              : "Düz metin paragraf…"
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addSection(lang, "paragraph")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[13px] font-medium text-[#424245] hover:bg-[#f5f5f7]"
                    >
                      <Pilcrow size={13} /> Paragraf ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => addSection(lang, "bullets")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[13px] font-medium text-[#424245] hover:bg-[#f5f5f7]"
                    >
                      <List size={13} /> Özellik listesi ekle
                    </button>
                  </div>
                  {showPreview && <DescPreview text={serializeSections(form[lang])} />}
                </div>
              ))}
            </div>
          </Card>

          {/* Teknik özellikler — satır bazlı liste */}
          <Card
            title="Teknik Özellikler"
            desc={
              'Her satıra bir özellik yazın. ";" veya ":" ile biten satır grup başlığı olur (örn. "Korumalar ve Hatalar;"), Tab ile içeri alınan satırlar o grubun alt maddesi olarak gösterilir. Sitede koyu renkli spec bölümü olarak yer alır.'
            }
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {(["featuresTr", "featuresEn"] as const).map((lang) => (
                <div key={lang}>
                  <p className="mb-2 text-[13px] font-medium text-[#424245]">
                    {lang === "featuresTr"
                      ? "Teknik Özellikler (TR)"
                      : "Teknik Özellikler (EN)"}
                  </p>
                  <textarea
                    className={`${inputCls} min-h-[180px] resize-y font-mono text-[13px] leading-relaxed`}
                    value={form[lang]}
                    onChange={(e) => set(lang, e.target.value)}
                    placeholder={
                      lang === "featuresTr"
                        ? "Metal Kutu / IP 54\nGüç Beslemesi 3 Faz-50/60Hz 400V ±%15\nKorumalar ve Hatalar;\n\tMotor Aşırı Akım (Ayarlanabilir)\n\tFaz kaybı koruması"
                        : "Metal Enclosure / IP 54\nPower supply 3-50/60Hz 400V ±%10\nProtections and Failures;\n\tMotor Overcurrent (Adjustable)\n\tPhase loss protection"
                    }
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Ürün görselleri: ana görsel + galeri aynı yerden eklenir */}
          <Card
            title="Ürün Görselleri"
            desc="Ana görsel ürün kartında ve detay sayfasının başında kullanılır. Diğer açılardan çekimleri galeriye ekleyin. EN görselleri opsiyoneldir."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <UploadSlot
                kind="image"
                label="Ana Görsel (TR)"
                value={form.mainImageTr}
                onChange={(v) => set("mainImageTr", v)}
              />
              <UploadSlot
                kind="image"
                label="Ana Görsel (EN)"
                value={form.mainImageEn}
                onChange={(v) => set("mainImageEn", v)}
              />
            </div>

            <div className="my-6 h-px bg-[#f0f0f0]" />

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Galeri</h3>
              <p className="text-[13px] text-[#86868b]">
                Detay sayfasında küçük resim şeridi olarak gösterilir. Yalnız EN
                görseli olan satır sadece İngilizce sayfada görünür.
              </p>
            </div>
            {form.gallery.length === 0 && (
              <p className="mb-4 text-[13px] text-[#a1a1a6]">Henüz galeri görseli yok.</p>
            )}
            <div className="space-y-4">
              {form.gallery.map((g, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#424245]">
                      Görsel {i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveGallery(i, -1)}
                        disabled={i === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                        aria-label="Yukarı"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGallery(i, 1)}
                        disabled={i === form.gallery.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                        aria-label="Aşağı"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGallery(i)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#fee2e2] hover:text-[#dc2626]"
                        aria-label="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <UploadSlot
                      kind="image"
                      label="TR"
                      value={g.url}
                      onChange={(v) => updateGallery(i, { url: v })}
                    />
                    <UploadSlot
                      kind="image"
                      label="EN (opsiyonel)"
                      value={g.urlEn}
                      onChange={(v) => updateGallery(i, { urlEn: v })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addGallery}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            >
              <Plus size={16} /> Görsel ekle
            </button>
          </Card>

          {/* Uygulama görseli — ana görsel/galeriyle karışmasın diye ayrı */}
          <Card
            title="Uygulama Görseli"
            desc="Ürünün kullanım/uygulama sahnesini gösteren görsel (opsiyonel)."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <UploadSlot
                kind="image"
                label="Uygulama Görseli (TR)"
                value={form.appImageTr}
                onChange={(v) => set("appImageTr", v)}
              />
              <UploadSlot
                kind="image"
                label="Uygulama Görseli (EN)"
                value={form.appImageEn}
                onChange={(v) => set("appImageEn", v)}
              />
            </div>
          </Card>

          {/* Teknik tablolar */}
          <Card title="Teknik Tablolar" desc="İlk satır başlık olarak gösterilir.">
            {form.specTables.length === 0 && (
              <p className="mb-4 text-[13px] text-[#a1a1a6]">Henüz teknik tablo yok.</p>
            )}
            <div className="space-y-6">
              {form.specTables.map((t, ti) => {
                const lang = langOf(ti);
                const grid = lang === "en" ? t.dataEn : t.data;
                const enMissing = t.dataEn.length === 0;
                return (
                <div key={ti} className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
                  {/* Dil sekmeleri */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex rounded-lg border border-[#e5e5e5] bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => setTableLang(ti, "tr")}
                        className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                          lang === "tr"
                            ? "bg-[#1d1d1f] text-white"
                            : "text-[#86868b] hover:text-[#1d1d1f]"
                        }`}
                      >
                        Türkçe
                      </button>
                      <button
                        type="button"
                        onClick={() => setTableLang(ti, "en")}
                        className={`relative rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                          lang === "en"
                            ? "bg-[#1d1d1f] text-white"
                            : "text-[#86868b] hover:text-[#1d1d1f]"
                        }`}
                      >
                        English
                        {enMissing && (
                          <span
                            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#f59e0b]"
                            title="İngilizce tablo henüz oluşturulmadı"
                          />
                        )}
                      </button>
                    </div>
                    {enMissing && lang === "tr" && (
                      <span className="hidden text-[12px] text-[#b45309] sm:block">
                        İngilizce tablo yok — EN sekmesinden oluşturun
                      </span>
                    )}
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      value={lang === "en" ? t.nameEn : t.name}
                      onChange={(e) =>
                        updateTable(
                          ti,
                          lang === "en"
                            ? { nameEn: e.target.value }
                            : { name: e.target.value }
                        )
                      }
                      placeholder={
                        lang === "en"
                          ? "Table title (e.g. Order Table)"
                          : "Tablo başlığı (örn. Sipariş Tablosu)"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => moveTable(ti, -1)}
                      disabled={ti === 0}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                      aria-label="Tabloyu yukarı taşı"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTable(ti, 1)}
                      disabled={ti === form.specTables.length - 1}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                      aria-label="Tabloyu aşağı taşı"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTable(ti)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#fee2e2] hover:text-[#dc2626]"
                      aria-label="Tabloyu sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {lang === "en" && grid.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#d2d2d7] bg-white px-5 py-8 text-center">
                      <p className="text-[14px] font-medium text-[#1d1d1f]">
                        İngilizce tablo henüz yok
                      </p>
                      <p className="mx-auto mt-1 max-w-md text-[13px] text-[#86868b]">
                        Türkçe tabloyu kopyalayıp başlıkları ve dipnotları İngilizceye
                        çevirmeniz yeterli — sayılar aynı kalır. İngilizce tablo yoksa
                        sitede İngilizce dilde de Türkçe tablo gösterilir.
                      </p>
                      <button
                        type="button"
                        onClick={() => copyTrToEn(ti)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1d1d1f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black"
                      >
                        <ClipboardPaste size={15} /> Türkçe tablodan kopyala
                      </button>
                    </div>
                  ) : (
                  <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <tbody>
                        {/* Sütun silme şeridi */}
                        {(grid[0]?.length ?? 0) > 1 && (
                          <tr>
                            {(grid[0] ?? []).map((_, c) => (
                              <td key={c} className="p-0.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeCol(ti, c)}
                                  className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] text-[#c4c4c4] hover:bg-[#fee2e2] hover:text-[#dc2626]"
                                  aria-label={`Sütun ${c + 1}'i sil`}
                                  title={`Sütun ${c + 1}'i sil`}
                                >
                                  <X size={11} /> sütunu sil
                                </button>
                              </td>
                            ))}
                            <td />
                          </tr>
                        )}
                        {grid.map((row, r) => (
                          <tr key={r}>
                            {row.map((cell, c) => (
                              <td key={c} className="p-0.5">
                                <input
                                  className={`w-full min-w-[110px] rounded-lg border border-[#e5e5e5] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#dc2626] ${
                                    r === 0 ? "font-semibold text-[#1d1d1f]" : "text-[#424245]"
                                  }`}
                                  value={cell}
                                  onChange={(e) => setCell(ti, r, c, e.target.value)}
                                  placeholder={r === 0 ? (lang === "en" ? `Header ${c + 1}` : `Başlık ${c + 1}`) : ""}
                                />
                              </td>
                            ))}
                            <td className="pl-1">
                              <div className="flex items-center">
                                {r > 0 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => moveRow(ti, r, -1)}
                                      disabled={r <= 1}
                                      className="flex h-8 w-7 items-center justify-center rounded-lg text-[#c4c4c4] hover:bg-white hover:text-[#1d1d1f] disabled:opacity-25"
                                      aria-label="Satırı yukarı taşı"
                                    >
                                      <ArrowUp size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveRow(ti, r, 1)}
                                      disabled={r === grid.length - 1}
                                      className="flex h-8 w-7 items-center justify-center rounded-lg text-[#c4c4c4] hover:bg-white hover:text-[#1d1d1f] disabled:opacity-25"
                                      aria-label="Satırı aşağı taşı"
                                    >
                                      <ArrowDown size={13} />
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeRow(ti, r)}
                                  disabled={grid.length <= 1}
                                  className="flex h-8 w-7 items-center justify-center rounded-lg text-[#c4c4c4] hover:bg-[#fee2e2] hover:text-[#dc2626] disabled:opacity-25"
                                  aria-label="Satırı sil"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addRow(ti)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[13px] font-medium text-[#424245] hover:bg-[#f5f5f7]"
                    >
                      <Rows3 size={14} /> Satır ekle
                    </button>
                    <button
                      type="button"
                      onClick={() => addCol(ti)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[13px] font-medium text-[#424245] hover:bg-[#f5f5f7]"
                    >
                      <Columns3 size={14} /> Sütun ekle
                    </button>
                    {lang === "en" && (
                      <button
                        type="button"
                        onClick={() => copyTrToEn(ti)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] bg-white px-3 py-1.5 text-[13px] font-medium text-[#424245] hover:bg-[#f5f5f7]"
                      >
                        <ClipboardPaste size={14} /> Türkçeden yeniden kopyala
                      </button>
                    )}
                  </div>
                  </>
                  )}
                </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addTable}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                <Plus size={16} /> Tablo ekle
              </button>
              <button
                type="button"
                onClick={() => setShowTableImport(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                <Upload size={16} /> CSV içe aktar (dosya seç veya yapıştır)
              </button>
            </div>
          </Card>

          {/* Dokümanlar */}
          <Card title="Dokümanlar" desc="Katalog, kılavuz, sertifika (CE), teknik doküman ve CAD dosyaları.">
            {form.documents.length === 0 && (
              <p className="mb-4 text-[13px] text-[#a1a1a6]">Henüz doküman yok.</p>
            )}
            {(() => {
              const seen = new Map<string, number>();
              for (const d of form.documents) {
                seen.set(d.type, (seen.get(d.type) ?? 0) + 1);
              }
              const dups = [...seen.entries()].filter(([, n]) => n > 1);
              if (!dups.length) return null;
              return (
                <p className="mb-4 flex items-center gap-1.5 rounded-xl bg-[#fffbeb] px-3.5 py-2.5 text-[13px] text-[#b45309]">
                  <AlertCircle size={14} className="shrink-0" />
                  Aynı türde birden fazla doküman var:{" "}
                  {dups.map(([t, n]) => `${DOC_TYPE_LABELS[t] ?? t} (${n})`).join(", ")}.
                  Bilinçliyse sorun değil.
                </p>
              );
            })()}
            <div className="space-y-4">
              {form.documents.map((d, i) => (
                <div key={i} className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#424245]">
                      Doküman {i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveDoc(i, -1)}
                        disabled={i === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                        aria-label="Yukarı"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveDoc(i, 1)}
                        disabled={i === form.documents.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-white disabled:opacity-25"
                        aria-label="Aşağı"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDoc(i)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#fee2e2] hover:text-[#dc2626]"
                        aria-label="Sil"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tür">
                      <select
                        className={inputCls}
                        value={d.type}
                        onChange={(e) => updateDoc(i, { type: e.target.value })}
                      >
                        {DOCUMENT_TYPES.map((tp) => (
                          <option key={tp} value={tp}>
                            {DOC_TYPE_LABELS[tp] ?? tp}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="hidden sm:block" />
                    <Field label="Ad (TR)">
                      <input
                        className={inputCls}
                        value={d.nameTr}
                        onChange={(e) => updateDoc(i, { nameTr: e.target.value })}
                        placeholder="örn. Ürün Kataloğu"
                      />
                    </Field>
                    <Field label="Ad (EN)">
                      <input
                        className={inputCls}
                        value={d.nameEn}
                        onChange={(e) => updateDoc(i, { nameEn: e.target.value })}
                        placeholder="e.g. Product Catalog"
                      />
                    </Field>
                    <UploadSlot
                      kind="pdf"
                      label="Dosya (TR)"
                      value={d.url}
                      onChange={(v) => updateDoc(i, { url: v })}
                    />
                    <UploadSlot
                      kind="pdf"
                      label="Dosya (EN, opsiyonel)"
                      value={d.urlEn}
                      onChange={(v) => updateDoc(i, { urlEn: v })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDoc}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
            >
              <Plus size={16} /> Doküman ekle
            </button>
          </Card>
        </div>
      </div>

      {showTableImport && (
        <TableImportModal
          onImport={(name, data) => {
            set("specTables", [
              ...form.specTables,
              { name, nameEn: "", data, dataEn: [] },
            ]);
            setShowTableImport(false);
          }}
          onClose={() => setShowTableImport(false)}
        />
      )}

      {showCatPicker && (
        <CategoryPicker
          categories={categories}
          value={form.categoryId}
          onSelect={(id) => {
            set("categoryId", id);
            setShowCatPicker(false);
          }}
          onClose={() => setShowCatPicker(false)}
        />
      )}

      {/* Kategorisiz kaydetme onayı */}
      {showNoCatConfirm !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowNoCatConfirm(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Kategori seçilmedi</h3>
            <p className="mt-2 text-sm text-[#86868b]">
              Bu ürün hiçbir kategoriye bağlı olmadığı için menüde ve kategori
              sayfalarında <strong>görünmeyecek</strong>; yalnızca doğrudan adresinden
              erişilebilecek. Yine de kaydedilsin mi?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowNoCatConfirm(null);
                  setShowCatPicker(true);
                }}
                className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                Kategori Seç
              </button>
              <button
                type="button"
                onClick={() => {
                  const stay = showNoCatConfirm.stay;
                  setShowNoCatConfirm(null);
                  handleSave({ stay, skipCatCheck: true });
                }}
                className="rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
              >
                Kategorisiz Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kaydetmeden çıkma onayı */}
      {showLeaveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowLeaveConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[#1d1d1f]">
              Kaydedilmemiş değişiklikler var
            </h3>
            <p className="mt-2 text-sm text-[#86868b]">
              Çıkarsanız bu formdaki değişiklikler kaybolur.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
              >
                Formda Kal
              </button>
              <button
                type="button"
                onClick={() => router.push("/yonetim/urunler")}
                className="rounded-xl bg-[#dc2626] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c]"
              >
                Kaydetmeden Çık
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Kategori seçici modal ------------------------ */

type CatNode = AdminCategory & { children: CatNode[]; depth: number };

function buildCatTree(cats: AdminCategory[]): CatNode[] {
  const byParent = new Map<number | null, AdminCategory[]>();
  for (const c of cats) {
    const key = c.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.order - b.order);
  const make = (parentId: number | null, depth: number): CatNode[] =>
    (byParent.get(parentId) ?? []).map((c) => ({
      ...c,
      depth,
      children: make(c.id, depth + 1),
    }));
  return make(null, 0);
}

function CategoryPicker({
  categories,
  value,
  onSelect,
  onClose,
}: {
  categories: AdminCategory[];
  value: number | null;
  onSelect: (id: number | null) => void;
  onClose: () => void;
}) {
  const tree = useMemo(() => buildCatTree(categories), [categories]);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set()); // hepsi kapalı

  const toggle = (id: number) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderNode = (node: CatNode) => {
    const hasChildren = node.children.length > 0;
    const isOpen = expanded.has(node.id);
    const selected = value === node.id;

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-1 rounded-xl py-1.5 pr-2 transition-colors ${
            selected ? "bg-[#fee2e2]" : "hover:bg-[#f5f5f7]"
          }`}
          style={{ paddingLeft: node.depth * 20 + 4 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(node.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#86868b] hover:bg-white"
              aria-label={isOpen ? "Daralt" : "Genişlet"}
            >
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#d2d2d7]">
              <Folder size={14} />
            </span>
          )}

          <button
            type="button"
            onClick={() => (hasChildren ? toggle(node.id) : onSelect(node.id))}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span
              className={`truncate text-sm ${
                selected ? "font-semibold text-[#dc2626]" : "font-medium text-[#1d1d1f]"
              }`}
            >
              {node.nameTr}
            </span>
            <span className="shrink-0 text-[12px] text-[#a1a1a6]">
              {node.totalProductCount} ürün
            </span>
          </button>

          {selected ? (
            <span className="flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-[#dc2626]">
              <Check size={15} /> Seçili
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#0071e3] opacity-0 transition-opacity hover:bg-white group-hover:opacity-100"
            >
              Seç
            </button>
          )}
        </div>

        {hasChildren && isOpen && <div>{node.children.map(renderNode)}</div>}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1d1d1f]">Kategori Seç</h3>
            <p className="mt-0.5 text-[13px] text-[#86868b]">
              Ürünün ekleneceği kategoriyi seçin. Alt dalları açmak için oka tıklayın.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#86868b] hover:bg-[#f5f5f7]"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {/* Ana seviye (kategori yok) */}
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
              value == null ? "bg-[#fee2e2]" : "hover:bg-[#f5f5f7]"
            }`}
          >
            <span
              className={`text-sm ${
                value == null ? "font-semibold text-[#dc2626]" : "font-medium text-[#1d1d1f]"
              }`}
            >
              Kategori yok (bağımsız)
            </span>
            {value == null && (
              <span className="flex items-center gap-1 text-[13px] font-semibold text-[#dc2626]">
                <Check size={15} /> Seçili
              </span>
            )}
          </button>

          <div className="my-1 h-px bg-[#f0f0f0]" />

          {tree.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-[#86868b]">
              Henüz kategori yok. Önce “Kategoriler” bölümünden kategori ekleyin.
            </p>
          ) : (
            tree.map(renderNode)
          )}
        </div>
      </div>
    </div>
  );
}
