# -*- coding: utf-8 -*-
"""yenitam klasöründen ürünleri siteye aktarır.

- Eski tüm ürün/doküman kayıtlarını ve uploads dosyalarını siler
- Görselleri WebP'ye çevirir (maks 1600px), birebir TR/EN kopyaları tekilleştirir
- docx açıklama ve teknik özellikleri site formatına çevirir
- EN xlsx tabloları Türkçeleştirip iki dilli spec tablosu üretir
- Dokümanları (PDF/DWG) normalize adlarla kopyalar

Kullanım:
  python3 import.py --dry-run   # önizleme, DB'ye yazmaz
  python3 import.py             # gerçek import
"""
import argparse
import hashlib
import json
import re
import shutil
import sqlite3
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import docx as docxlib
import openpyxl
from PIL import Image

YENITAM = Path.home() / "Desktop" / "yenitam"
PROJECT = Path(__file__).resolve().parents[2]
DB = PROJECT / "taytech.db"
UPLOADS = PROJECT / "public" / "uploads"

NOW = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "+00:00")

report = {"products": [], "warnings": [], "deleted": {}, "images": {"converted": 0, "deduped": 0, "bytes_in": 0, "bytes_out": 0}}

def warn(msg):
    report["warnings"].append(msg)
    print(f"  ! {msg}")

# ----------------------------------------------------------------- yardımcılar
def slugify(s):
    s = s.replace("ı", "i").replace("İ", "I").replace("ğ", "g").replace("Ğ", "G")
    s = s.replace("ş", "s").replace("Ş", "S").replace("ç", "c").replace("Ç", "C")
    s = s.replace("ö", "o").replace("Ö", "O").replace("ü", "u").replace("Ü", "U")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s

def fix_en(text):
    """İngilizce metinde Türkçe İ/ı kalıntılarını düzeltir."""
    return text.replace("İ", "I").replace("ı", "i")

def file_sig(p: Path):
    return hashlib.sha1(p.read_bytes()).hexdigest()

def listdir(d: Path):
    if not d.is_dir():
        return []
    return sorted(
        [f for f in d.iterdir() if f.is_file() and not f.name.startswith(".")
         and f.name not in ("OKUBENI.txt", "URUN-BILGI.txt")],
        key=lambda f: f.name.lower(),
    )

# ---------------------------------------------------------- dil sınıflandırma
EN_TOKEN = re.compile(r"(?:^|[\s\-_.])(en|uk)(?=[\s\-_.]|\d|$)", re.IGNORECASE)
TREN_TOKEN = re.compile(r"(?:^|[\s\-_.])tren(?=[\s\-_.]|$)", re.IGNORECASE)
TR_TOKEN = re.compile(r"(?:^|[\s\-_.])tr(?=[\s\-_.]|$)", re.IGNORECASE)

def lang_of(name: str):
    """Dosya adından dil: 'tr' | 'en' | 'both'. Ürün kodu içindeki -TR-/-UK- kısımlarını
    değil, ad sonundaki eki esas alır."""
    stem = Path(name).stem
    if TREN_TOKEN.search(stem):
        return "both"
    # ad sonuna yakın açık ek: "...-en", "... en", "...-uk"
    tail = stem[-14:]
    if re.search(r"[-\s_.](en|uk)\s*$", stem, re.IGNORECASE):
        return "en"
    if re.search(r"[-\s_.]en[\s_.]?\d*\s*$", tail, re.IGNORECASE):
        return "en"
    if re.search(r"[-\s_.]tr\s*$", stem, re.IGNORECASE):
        return "tr"
    # UK ürün kodu (ör. D-HEM-UK-RH...) → EN görseli
    if re.search(r"[-_]UK[-_]", stem):
        return "en"
    # "...UK_U6D0 Render Kabin.png" gibi kod içinde UK
    if re.search(r"UK[_-]", stem):
        return "en"
    return "tr"

# ----------------------------------------------------------- görsel dönüştürme
def to_webp(src: Path, dest: Path, max_px=1600, quality=82):
    # aynı kaynaktan üretilmiş dosya zaten varsa yeniden dönüştürme
    if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
        report["images"]["converted"] += 1
        return
    with Image.open(src) as im:
        im.load()
        if im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGBA" if "A" in im.getbands() or "transparency" in im.info else "RGB")
        w, h = im.size
        scale = min(1.0, max_px / max(w, h))
        if scale < 1.0:
            im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        im.save(dest, "WEBP", quality=quality, method=6)
    report["images"]["converted"] += 1
    report["images"]["bytes_in"] += src.stat().st_size
    report["images"]["bytes_out"] += dest.stat().st_size

# -------------------------------------------------------------- docx ayrıştırma
# Word madde işaretleri metne özel sembol karakteri (PUA/Wingdings) olarak gelir
BULLET_CHARS = re.compile(r"[\ue000-\uf8ff\u2022\u2219\u25aa\u25cf\u25e6\u00b7\u2043\u2027]")

def docx_paras(p: Path):
    """Paragrafları (metin, madde_mi, alt_madde_mi) olarak döndürür.
    Boş paragraflar ("", False, False) olarak korunur (paragraf ayracı)."""
    d = docxlib.Document(str(p))
    out = []
    for para in d.paragraphs:
        raw = para.text.replace("\u00a0", " ").rstrip()
        if not raw.strip():
            if out and out[-1][0] != "":
                out.append(("", False, False))
            continue
        has_bullet_char = bool(BULLET_CHARS.search(raw[:3]))
        cleaned = BULLET_CHARS.sub("", raw)
        is_sub = bool(re.match(r"^\s*\t", cleaned))
        is_bullet = has_bullet_char or cleaned.startswith((" ", "\t"))
        out.append((cleaned, is_bullet, is_sub))
    while out and out[-1][0] == "":
        out.pop()
    return out

def join_wrapped(lines):
    """PDF'ten kopyalanan satır kırılmalarını tek paragrafa birleştirir;
    satır sonu hecelemelerini (kendi- + ne → kendine) onarır."""
    buf = ""
    for line in lines:
        if not buf:
            buf = line
            continue
        if buf.endswith("-") and line and line[0].islower():
            buf = buf[:-1] + line
        else:
            buf += " " + line
    return clean_inline(buf)

def clean_inline(s):
    s = re.sub(r"[ ]{2,}", " ", s.strip())
    s = re.sub(r"\s+([,;.!?])", r"\1", s)
    return s

TITLE_MAX_WORDS = 4

def tr_upper(s):
    return s.replace("i", "İ").replace("ı", "I").upper()

def parse_description(paras, product_names, is_en=False):
    """docx paragraflarını site açıklama formatına çevirir.

    - Baştaki ürün adı satırı atılır (sayfada zaten başlık var)
    - Ardışık düz satırlar tek paragrafta birleştirilir (PDF kopyası satır
      kırılmaları ve heceleme onarılır)
    - Madde paragrafları "• " olur; tab ile sütunlanmış listeler bölünür
    - Kısa başlık satırları BÜYÜK HARF ara başlık olur
    """
    names_l = [n.lower().replace("®", "").strip() for n in product_names]

    # baştaki ürün adı satırını düş
    items = list(paras)
    if items:
        first = items[0][0].strip()
        low = first.lower().replace("®", "").strip()
        if first and len(first.split()) <= 5 and not first.endswith((".", "!", "?")) and (
            any(low in n or n in low for n in names_l) or "seri" in low or len(first) < 30
        ) and not items[0][1]:
            items = items[1:]

    lines = []
    plain_buf = []

    def flush_plain():
        if not plain_buf:
            return
        text = join_wrapped(plain_buf)
        plain_buf.clear()
        if not text:
            return
        if len(text.split()) <= TITLE_MAX_WORDS and not re.search(r"[.:!?,;]$", text) and len(text) <= 40:
            lines.append("")
            lines.append(text.upper() if is_en else tr_upper(text))
        else:
            lines.append("")
            lines.append(text)

    for raw, is_bullet, _sub in items:
        stripped = raw.strip()
        if not stripped:
            # boş paragraf: cümle ortasında bölünmüş metni ayırma (PDF kopyası),
            # yalnız cümle sonunda paragraf sınırı say
            if plain_buf and re.search(r"[.!?:;…]$", plain_buf[-1].strip()):
                flush_plain()
            continue
        # sütunlu uygulama listesi (tab ile ayrılmış)
        if "\t" in stripped and not is_bullet or ("\t" in stripped.strip() and len(re.split(r"\t+", stripped)) > 1 and is_bullet and stripped.count("\t") >= 2):
            flush_plain()
            for part in re.split(r"\t+", stripped):
                part = clean_inline(part)
                if part:
                    lines.append(f"• {part}")
            continue
        text = clean_inline(stripped)
        if is_bullet:
            flush_plain()
            if len(text) < 60 and text.endswith(";"):
                text = text.rstrip(";").rstrip()
            lines.append(f"• {text}")
        else:
            # madde devamı: önceki madde "-" ile bitiyorsa ve satır küçük harfle başlıyorsa
            if lines and lines[-1].startswith("• ") and not plain_buf and (
                lines[-1].endswith("-") and text[:1].islower()
            ):
                lines[-1] = lines[-1][:-1] + text
                continue
            plain_buf.append(text)
    flush_plain()

    out = []
    for l in lines:
        if l == "" and (not out or out[-1] == ""):
            continue
        out.append(l)
    return "\n".join(out).strip()

FEATURES_HEADING = re.compile(
    r"(teknik özell?ikler|technical features|technical specifications|features|özellikler)",
    re.IGNORECASE,
)

def is_features_heading(text):
    t = text.replace("İ", "i").replace("I", "i").replace("ı", "i").lower().strip()
    return bool(re.fullmatch(r"(teknik özell?ikler|technical features|technical specifications|features|özellikler)", t))

def parse_features(paras):
    """Teknik özellikler docx'i → satır bazlı liste.

    İki mod:
    - Spec-sheet modu: satırların çoğu "Anahtar\t:\tDeğer" ise, "Anahtar: Değer"
      maddelerine çevrilir; ":" içermeyen kısa satırlar grup başlığı (";" eklenir).
    - Normal mod: madde paragrafları satır olur; tab'lı satır alt madde;
      madde olmayan devam satırları öncekine eklenir (satır kırılması onarımı).
    """
    rows = [(clean_r, b, s) for (clean_r, b, s) in paras if clean_r.strip()]
    body = [r for r in rows if not is_features_heading(r[0].strip())]

    kv = [r for r in body if re.search(r"\t\s*:", r[0]) or re.match(r"^[^:]{2,45}:\s*\S", r[0].strip())]
    if body and len(kv) >= max(3, len(body) // 2):
        # spec-sheet modu
        lines = []
        for raw, _b, _s in body:
            text = raw.strip()
            m = re.match(r"^(.*?)[\t ]*:[\t ]*(.*)$", text)
            if m and m.group(2).strip():
                key = clean_inline(m.group(1))
                val = clean_inline(m.group(2))
                lines.append(f"\t{key}: {val}")
            else:
                head = clean_inline(text).rstrip(":;")
                lines.append(f"{head};")
        # baştaki grupsuz maddelerin tab'ını kaldır (ilk grup başlığından öncekiler)
        out = []
        seen_group = False
        for l in lines:
            if l.endswith(";"):
                seen_group = True
                out.append(l)
            else:
                out.append(l if seen_group else l.lstrip("\t"))
        return "\n".join(out).strip()

    lines = []
    for raw, is_bullet, is_sub in body:
        text = clean_inline(raw.strip())
        if not text:
            continue
        if not is_bullet and lines:
            # önceki satırın devamı (PDF kopyası satır kırılması)
            prev = lines[-1]
            if prev.endswith("-") and text[:1].islower():
                lines[-1] = prev[:-1] + text
            else:
                lines[-1] = prev + " " + text
            continue
        lines.append(("\t" if is_sub else "") + text)
    return "\n".join(lines).strip()

# Kaynak dosyaları hatalı gelen ürünler için elle doğrulanmış düzeltmeler.
# (Şirket dosyasında EN özellik dosyasına TR açıklama konmuş vb.)
_SMARTHEXA_EN_6 = "\n".join([
    "Fully electronic control with PC connectivity via GSM or Ethernet for easy setup and commissioning",
    "Fast and precise DHW control with calibrated sensors",
    "Return temperature control for district heating with a high-efficiency heat exchanger",
    "Smart anti-legionella function for safe domestic hot water",
    "Pump and valve exercise mode to prevent sticking and ensure reliable operation",
    "Optimized for low-temperature underfloor heating, with an integrated mixing circuit for stable, comfortable performance and precise flow temperature control",
])
FEATURE_OVERRIDES = {
    # teknik özellikler-tr.docx yanlışlıkla (üstelik RH varyantının) tanıtım metni içeriyor
    "direct-smarthexa-dhw": {
        "featuresTr": "\n".join([
            "Hızlı kurulum ve devreye alma için GSM veya Ethernet üzerinden PC bağlantısı sağlayan tam elektronik kontrol",
            "Kalibre edilmiş sensörlerle hızlı ve hassas kullanım suyu (DHW) kontrolü",
            "Yüksek verimli ısı eşanjörlü bölgesel ısıtma için dönüş sıcaklığı kontrolü",
            "Güvenli kullanım suyu için akıllı lejyonella önleme fonksiyonu",
            "Sıkışmayı önlemek ve güvenilirliği sağlamak için pompa ve vana çalıştırma modu",
        ]),
    },
    # teknik özellikler-en.docx yanlışlıkla Türkçe tanıtım metni içeriyor
    "indirect-smarthexa-dhw-sh": {"featuresEn": _SMARTHEXA_EN_6},
    # teknik özellikler-en.docx yanlışlıkla Indirect SmartHexa tanıtım metni içeriyor
    "direct-smarthexa-ufh": {"featuresEn": _SMARTHEXA_EN_6},
}

# ------------------------------------------------------------ tablo çevirileri
KEY_TR = {
    "Suitable for district heating": "Bölgesel ısıtmaya uygun",
    "Suitable for heat pump": "Isı pompasına uygun",
    "Suitable for heating": "Isıtmaya uygun",
    "Suitable for cooling": "Soğutmaya uygun",
    "Sutiable for hot tap water": "Sıcak kullanım suyuna uygun",
    "Suitable for working with cirulation pump": "Sirkülasyon pompası ile çalışmaya uygun",
    "High efficiency pump": "Yüksek verimli pompa",
    "DHW Heat Exchanger": "Kullanım suyu (DHW) eşanjörü",
    "Material of heat exchanger": "Eşanjör malzemesi",
    "Full sealed heat exchanger": "Tam sızdırmaz eşanjör",
    "Suitable for using and fitting with heat meter": "Kalorimetre ile kullanıma uygun",
    "Suitable for using and fitting with cold water meter": "Soğuk su sayacı ile kullanıma uygun",
    "Primary supply temperature": "Primer besleme sıcaklığı",
    "Primary pressure difference": "Primer basınç farkı",
    "Hot water capacity continously": "Sürekli sıcak su kapasitesi",
    "DHW capacity": "Kullanım suyu (DHW) kapasitesi",
    "Max. Heating capacity": "Maks. ısıtma kapasitesi",
    "Inlet / Outlet connections for Heating, cold water, hot water and primary supply":
        "Isıtma, soğuk su, sıcak su ve primer besleme giriş/çıkış bağlantıları",
    "Hot water priority": "Sıcak su önceliği",
    "Differential Pressure Balancing Valve included": "Fark basınç dengeleme vanası dahil",
    "Keep warm function": "Sıcak tutma fonksiyonu",
    "Strainer for primary line": "Primer hat pislik tutucu",
    "Zone valve control for heating side": "Isıtma tarafı zon vanası kontrolü",
    "Height": "Yükseklik",
    "Widht": "Genişlik",
    "Depth": "Derinlik",
}
KEY_EN_FIX = {
    "Sutiable for hot tap water": "Suitable for hot tap water",
    "Suitable for working with cirulation pump": "Suitable for working with circulation pump",
    "Hot water capacity continously": "Continuous hot water capacity",
    "Widht": "Width",
}
VAL_TR = {
    "YES": "Evet",
    "NO": "Hayır",
    "Stainless steel with copper soldered": "Bakır lehimli paslanmaz çelik",
    '3/4" Female connections': '3/4" dişi bağlantı',
    "15 l/m - 17 l/m at 65°C": "65°C'de 15 - 17 l/dk",
}

def parse_spec_table(xlsx: Path, product_name: str):
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    ws = wb.worksheets[0]
    rows = []
    for row in ws.iter_rows():
        vals = [("" if c.value is None else str(c.value).strip()) for c in row]
        rows.append(vals)
    # anahtar/değer çiftlerini topla (başlık ve boş satırlar atlanır)
    pairs = []
    for r in rows:
        key = r[0].strip() if len(r) > 0 else ""
        val = r[2].strip() if len(r) > 2 else ""
        if not key or key.lower() in ("specifications",):
            continue
        pairs.append([key, val])
    # bitişik iki anahtarlı tek değer satırını birleştir
    merged = []
    i = 0
    while i < len(pairs):
        k, v = pairs[i]
        if (k == "Inlet / Outlet connections for Heating, cold water"
                and i + 1 < len(pairs) and pairs[i + 1][0] == "Hot water and primary supply"):
            k = "Inlet / Outlet connections for Heating, cold water, hot water and primary supply"
            v = v or pairs[i + 1][1]
            i += 2
        else:
            i += 1
        merged.append([k, v])

    data_tr = [["Özellik", "Değer"]]
    data_en = [["Specification", "Value"]]
    for k, v in merged:
        ktr = KEY_TR.get(k)
        if ktr is None:
            warn(f"{product_name}: tablo anahtarı çevrilemedi: {k!r}")
            ktr = k
        ken = KEY_EN_FIX.get(k, k)
        vtr = VAL_TR.get(v, v)
        data_tr.append([ktr, vtr])
        data_en.append([ken, fix_en(v)])
    return {
        "name": "Ürün Özellikleri",
        "nameEn": "Product Specifications",
        "data": data_tr,
        "dataEn": data_en,
    }

# ------------------------------------------------------------- doküman türleri
# (regex, tür, dosya-adı-eki, TR ad, EN ad)
DOC_RULES = [
    (r"katalog", "katalog", "katalog", "Ürün Kataloğu", "Product Catalogue"),
    (r"k[ıi]lavuz|kulavuz", "kilavuz", "kilavuz", "Kullanım Kılavuzu", "User Manual"),
    (r"sertifika", "sertifika", "sertifika", "CE Sertifikası", "CE Certificate"),
    (r"cad|\.dwg$", "cad", "cad", "CAD Çizimi (DWG)", "CAD Drawing (DWG)"),
    (r"kabin", "teknik", "kabin-cizimi", "Kabin Çizimi", "Cabinet Drawing"),
    (r"müşteri|musteri", "teknik", "teknik-cizim", "Teknik Çizim", "Technical Drawing"),
    (r"akış|akis", "teknik", "akis-semasi", "Akış Şeması", "Flow Diagram"),
    (r"paketleme", "teknik", "paketleme", "Paketleme Bilgisi", "Packaging Information"),
    (r"opsiyon", "teknik", "opsiyonlar", "Ürün Opsiyonları", "Product Options"),
]
DOC_ORDER = {"katalog": 0, "kilavuz": 1, "teknik": 2, "sertifika": 3, "cad": 4}

def doc_meta(fname: str):
    low = fname.lower()
    for pat, typ, fslug, tr, en in DOC_RULES:
        if re.search(pat, low):
            return typ, fslug, tr, en
    stem = Path(fname).stem
    return "teknik", slugify(stem) or "dokuman", stem, stem

def variant_tag(fname: str):
    """Dosya adındaki varyant işareti (FxA, FxS, D, S, 2...)"""
    stem = Path(fname).stem
    m = re.search(r"\b(Fx[AS])\b", stem, re.IGNORECASE)
    if m:
        return m.group(1)[:2].capitalize() + m.group(1)[2].upper()  # FxA/FxS
    m = re.search(r"-([DS])-", stem)
    if m:
        return m.group(1)
    m = re.search(r"(?:tablo|katalog|k[ıi]lavuz)\s*(\d)", stem, re.IGNORECASE)
    if m:
        return m.group(1)
    return None

# --------------------------------------------------------------- ürün eşlemesi
# klasör adı → (slug, nameTr, nameEn) — eski slug'lar korunur, ® geri eklenir
PRODUCT_MAP = {
    "Direct Start": ("direkt-baslatma", "Direct Start", "Direct Start"),
    "Star & Delta Start": ("yildiz-ucgen-baslatma", "Star & Delta Start", "Star & Delta Start"),
    "Smart Hidrofor": ("smart-booster", "Smart Hidrofor", "Smart Booster"),
    "Smart Derin Kuyu": ("smart-bore-hole", "Smart Derin Kuyu", "Smart Bore Hole"),
    "Smart Box": ("smart-box", "Smart Box", "Smart Box"),
    "Smart Exclusive": ("smart-exclusive", "Smart Exclusive", "Smart Exclusive"),
    "Smart Grinder": ("smart-grinder", "Smart Grinder", "Smart Grinder"),
    "Smart Atık Su": ("smart-wastewater", "Smart Atık Su", "Smart Wastewater"),
    "IRONTRAP Manyetik Filtre": ("irontrap", "IRONTRAP® Manyetik Filtre", "IRONTRAP® Magnetic Filter"),
    "IRONINOX Manyetik Filtre": ("ironinox", "IRONINOX® Manyetik Filtre", "IRONINOX® Magnetic Filter"),
}
# menüde ürün sırası (kategori içinde); yoksa alfabetik
ORDER_MAP = {
    "smart-booster": 0, "smart-bore-hole": 1, "smart-box": 2,
    "smart-exclusive": 3, "smart-grinder": 4, "smart-wastewater": 5,
    "irontrap": 0, "ironinox": 1,
    "direkt-baslatma": 0, "yildiz-ucgen-baslatma": 1,
}
# görsel sıralaması: ön → sağ → sol → diğer; ABS/kabin varyantları sona
def image_sort_key(name: str):
    low = name.lower()
    variant = 1 if ("abs" in low or "kabin" in low) else 0
    if "ön" in low or "on-" in low or "front" in low:
        side = 0
    elif "sağ" in low or "sag" in low or "right" in low:
        side = 1
    elif "sol" in low or "left" in low:
        side = 2
    else:
        side = 3
    return (variant, side, low)

# kaldırılacak yer tutucu kategoriler (ürünle birebir aynı olanlar)
PLACEHOLDER_CATEGORY_SLUGS = [
    "indirect-thermohexa-sh",
    "indirect-hydro-em-dhw-sh",
    "direct-hydro-em-rh",
    "direct-hydro-em-ufh",
]

# --------------------------------------------------------------------- ana akış
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    dry = args.dry_run

    con = sqlite3.connect(DB)
    con.execute("PRAGMA foreign_keys = ON")
    cur = con.cursor()

    cats = cur.execute("SELECT id, slug, nameTr, parentId FROM Category").fetchall()
    cat_by_id = {c[0]: c for c in cats}
    children = {}
    for c in cats:
        children.setdefault(c[3], []).append(c)

    def find_cat(path_parts):
        """Klasör yolu → kategori id (nameTr eşleşmesiyle ağaçta iner)."""
        # kök klasörler DB'de farklı seviyelerde
        parent = None
        node = None
        for part in path_parts:
            pool = children.get(node, []) if node is not None else cats
            # ilk adımda tüm ağaçta ara (kökler DB'de iç seviyede olabilir)
            if node is None:
                match = [c for c in cats if c[2] == part]
            else:
                match = [c for c in children.get(node, []) if c[2] == part]
            if not match:
                return None
            node = match[0][0]
        return node

    # ---- ürün klasörlerini topla
    product_dirs = [d for d in sorted(YENITAM.rglob("*")) if d.is_dir() and (d / "3-aciklama").is_dir()]
    products = []

    for pdir in product_dirs:
        rel = pdir.relative_to(YENITAM)
        cat_path = list(rel.parts[:-1])
        folder_name = rel.parts[-1]

        # içerik tamamen boşsa atla
        total_files = sum(len(listdir(pdir / s)) for s in
                          ("1-urun-fotograflari", "2-uygulama-fotografi", "3-aciklama",
                           "4-teknik-ozellikler", "5-teknik-tablo", "6-dokumanlar"))
        if total_files == 0:
            warn(f"{rel}: içerik boş, atlandı")
            continue

        cat_id = find_cat(cat_path + [folder_name])  # klasör adı kategoriyle çakışıyor mu?
        # ürünler kategori DEĞİL; kategori id'si üst yoldan bulunur
        cat_id = find_cat(cat_path)
        if cat_id is None:
            warn(f"{rel}: kategori bulunamadı ({' / '.join(cat_path)}), atlandı")
            continue

        # URUN-BILGI'den EN adı
        name_tr, name_en = folder_name, folder_name
        ub = pdir / "URUN-BILGI.txt"
        if ub.exists():
            for line in ub.read_text(encoding="utf-8").splitlines():
                if line.startswith("Ürün adı (TR):"):
                    name_tr = line.split(":", 1)[1].strip()
                if line.startswith("Ürün adı (EN):"):
                    name_en = line.split(":", 1)[1].strip()

        if folder_name in PRODUCT_MAP:
            slug, name_tr, name_en = PRODUCT_MAP[folder_name]
        else:
            slug = slugify(name_tr)
        name_en = fix_en(name_en)

        # ---- Frekans İnvertör: FxA / FxS iki ürüne bölünür
        if folder_name == "Frekans İnvertör Serisi":
            for var, en_code in (("FxA", "FXA"), ("FxS", "FXS")):
                products.append({
                    "dir": pdir, "cat_id": find_cat(cat_path + [folder_name]) or cat_id,
                    "slug": f"{var.lower()}-serisi",
                    "nameTr": f"{var} Serisi", "nameEn": f"{var} Series",
                    "variant": var, "variant_img": en_code,
                })
            continue

        products.append({
            "dir": pdir, "cat_id": cat_id, "slug": slug,
            "nameTr": name_tr, "nameEn": name_en, "variant": None, "variant_img": None,
        })

    print(f"Toplam içe aktarılacak ürün: {len(products)}")

    # ---- eski verileri temizle
    if not dry:
        report["deleted"]["products"] = cur.execute("SELECT COUNT(*) FROM Product").fetchone()[0]
        report["deleted"]["documents"] = cur.execute("SELECT COUNT(*) FROM Document").fetchone()[0]
        cur.execute("DELETE FROM Document")
        cur.execute("DELETE FROM Product")
        for cslug in PLACEHOLDER_CATEGORY_SLUGS:
            cur.execute("DELETE FROM Category WHERE slug = ?", (cslug,))
        report["deleted"]["placeholder_categories"] = PLACEHOLDER_CATEGORY_SLUGS
        # webp'ler deterministik adlıdır ve kaynaktan yeniden üretilebilir;
        # hız için silinmez (to_webp güncel olanı atlar). Kalan artıklar
        # import sonunda DB referanslarıyla karşılaştırılarak temizlenir.
        if UPLOADS.exists():
            for f in UPLOADS.iterdir():
                if f.is_file() and f.suffix.lower() != ".webp":
                    f.unlink()
        else:
            UPLOADS.mkdir(parents=True)

    # ---- ürünleri işle
    order_counter = {}
    for prod in sorted(products, key=lambda p: (p["cat_id"], ORDER_MAP.get(p["slug"], 99), p["nameTr"].lower())):
        pdir, slug, var = prod["dir"], prod["slug"], prod["variant"]
        print(f"\n### {prod['nameTr']}  (slug={slug})")
        entry = {"slug": slug, "nameTr": prod["nameTr"], "nameEn": prod["nameEn"], "catId": prod["cat_id"]}

        def var_match(fname):
            """Varyantlı üründe (FxA/FxS) yalnız kendi dosyaları."""
            if not var:
                return True
            tag = variant_tag(fname)
            if tag in ("FxA", "FxS"):
                return tag == var
            up = fname.upper()
            if prod["variant_img"] and prod["variant_img"] in up.replace(" ", ""):
                return True
            if "FXA" in up.replace(" ", "") or "FXS" in up.replace(" ", ""):
                return False
            return True  # varyant işareti olmayan ortak dosyalar herkese

        # ---------------- görseller
        photos = [f for f in listdir(pdir / "1-urun-fotograflari") if var_match(f.name)]
        by_lang = {"tr": [], "en": [], "both": []}
        for f in photos:
            by_lang[lang_of(f.name)].append(f)
        # birebir aynı tr/en çiftlerini tekilleştir
        sigs_tr = {file_sig(f): f for f in by_lang["tr"]}
        en_unique = []
        for f in by_lang["en"]:
            s = file_sig(f)
            if s in sigs_tr:
                report["images"]["deduped"] += 1
            else:
                en_unique.append(f)
        tr_list = sorted(by_lang["tr"] + by_lang["both"], key=lambda f: image_sort_key(f.name))
        en_list = sorted(en_unique, key=lambda f: image_sort_key(f.name))

        gallery = []
        n = max(len(tr_list), len(en_list))
        for i in range(n):
            url = url_en = None
            if i < len(tr_list):
                dest = UPLOADS / f"{slug}-{i+1}.webp"
                if not dry:
                    to_webp(tr_list[i], dest)
                url = f"/uploads/{dest.name}"
            if i < len(en_list):
                dest = UPLOADS / f"{slug}-{i+1}-en.webp"
                if not dry:
                    to_webp(en_list[i], dest)
                url_en = f"/uploads/{dest.name}"
            gallery.append({"url": url or "", "urlEn": url_en})
        main_tr = next((g["url"] for g in gallery if g["url"]), None)
        main_en = next((g["urlEn"] for g in gallery if g["urlEn"]), None)
        if not photos:
            warn(f"{slug}: hiç ürün fotoğrafı yok")
        entry["images"] = {"tr": len(tr_list), "en": len(en_list)}

        # ---------------- uygulama fotoğrafı
        app_tr = app_en = None
        app_files = [f for f in listdir(pdir / "2-uygulama-fotografi") if var_match(f.name)]
        app_by = {"tr": None, "en": None}
        for f in app_files:
            l = lang_of(f.name)
            if l == "both":
                app_by["tr"] = app_by["tr"] or f
            else:
                app_by[l] = app_by[l] or f
        if app_by["tr"] and app_by["en"] and file_sig(app_by["tr"]) == file_sig(app_by["en"]):
            app_by["en"] = None
            report["images"]["deduped"] += 1
        for l, f in (("tr", app_by["tr"]), ("en", app_by["en"])):
            if not f:
                continue
            try:
                dest = UPLOADS / (f"{slug}-app.webp" if l == "tr" else f"{slug}-app-en.webp")
                if not dry:
                    to_webp(f, dest)
                if l == "tr":
                    app_tr = f"/uploads/{dest.name}"
                else:
                    app_en = f"/uploads/{dest.name}"
            except Exception as e:
                warn(f"{slug}: uygulama fotoğrafı bozuk ({f.name}): {e}")

        # ---------------- açıklama
        desc_tr = desc_en = None
        for f in listdir(pdir / "3-aciklama"):
            if not var_match(f.name) or f.suffix.lower() != ".docx":
                continue
            l = lang_of(f.name)
            text = parse_description(docx_paras(f), [prod["nameTr"], prod["nameEn"]], is_en=(l == "en"))
            if l == "en":
                desc_en = fix_en(text) if text else None
            else:
                desc_tr = text or None
        if not desc_tr:
            warn(f"{slug}: Türkçe açıklama yok")
        if not desc_en:
            warn(f"{slug}: İngilizce açıklama yok")

        # ---------------- teknik özellikler
        feat_tr = feat_en = None
        for f in listdir(pdir / "4-teknik-ozellikler"):
            if not var_match(f.name) or f.suffix.lower() != ".docx":
                continue
            l = lang_of(f.name)
            text = parse_features(docx_paras(f))
            if l == "en":
                feat_en = fix_en(text) if text else None
            else:
                feat_tr = text or None
        # kaynak dosyası hatalı ürünler için elle düzeltme
        ov = FEATURE_OVERRIDES.get(slug, {})
        if "featuresTr" in ov:
            feat_tr = ov["featuresTr"]
            warn(f"{slug}: featuresTr kaynak dosyası hatalıydı, elle düzeltildi")
        if "featuresEn" in ov:
            feat_en = ov["featuresEn"]
            warn(f"{slug}: featuresEn kaynak dosyası hatalıydı, elle düzeltildi")
        # son güvenlik: EN alanında Türkçe karakter kaldıysa alanı boş bırak
        if feat_en and re.search(r"[çğşöüÇĞİŞÖÜ]", feat_en):
            warn(f"{slug}: featuresEn Türkçe içerik taşıyor, boş bırakıldı")
            feat_en = None

        # ---------------- teknik tablo
        spec_tables = []
        for f in listdir(pdir / "5-teknik-tablo"):
            if f.suffix.lower() != ".xlsx" or f.name.startswith("~$"):
                continue
            if not var_match(f.name):
                continue
            spec_tables.append(parse_spec_table(f, slug))
        entry["specTables"] = len(spec_tables)

        # ---------------- dokümanlar
        doc_groups = {}
        for f in listdir(pdir / "6-dokumanlar"):
            if not var_match(f.name):
                continue
            typ, fslug, ntr, nen = doc_meta(f.name)
            tag = variant_tag(f.name)
            if tag and tag not in ("FxA", "FxS"):
                ntr, nen = f"{ntr} ({tag})", f"{nen} ({tag})"
                fslug = f"{fslug}-{tag.lower()}"
            l = lang_of(f.name)
            key = (typ, fslug)
            doc_groups.setdefault(key, {"type": typ, "fslug": fslug, "nameTr": ntr, "nameEn": nen, "tr": None, "en": None})
            g = doc_groups[key]
            if l == "en":
                g["en"] = f
            elif l == "both":
                g["tr"] = g["tr"] or f
            else:
                g["tr"] = f

        documents = []
        for (typ, _), g in sorted(doc_groups.items(), key=lambda kv: (DOC_ORDER.get(kv[0][0], 9), kv[0][1])):
            src_tr, src_en = g["tr"], g["en"]
            if not src_tr and not src_en:
                continue
            base = src_tr or src_en
            ext = base.suffix.lower()
            url = url_en = None
            if src_tr:
                dest = UPLOADS / f"{slug}-{g['fslug']}{ext}"
                if not dry:
                    shutil.copyfile(src_tr, dest)
                url = f"/uploads/{dest.name}"
            if src_en:
                dest = UPLOADS / f"{slug}-{g['fslug']}-en{ext}"
                if not dry:
                    shutil.copyfile(src_en, dest)
                url_en = f"/uploads/{dest.name}"
            if url is None:  # yalnız EN varsa onu ana dosya yap
                url, url_en = url_en, None
                warn(f"{slug}: {g['nameTr']} yalnız İngilizce")
            documents.append({
                "type": typ, "nameTr": g["nameTr"], "nameEn": g["nameEn"],
                "url": url, "urlEn": url_en,
            })
        entry["documents"] = len(documents)

        # ---------------- DB kaydı
        order = order_counter.get(prod["cat_id"], 0)
        order_counter[prod["cat_id"]] = order + 1
        if not dry:
            cur.execute(
                """INSERT INTO Product (slug, "order", isActive, nameTr, nameEn, descTr, descEn,
                     featuresTr, featuresEn, mainImageTr, mainImageEn, appImageTr, appImageEn,
                     specTable, gallery, categoryId, createdAt, updatedAt)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (slug, order, 1, prod["nameTr"], prod["nameEn"], desc_tr, desc_en,
                 feat_tr, feat_en, main_tr, main_en, app_tr, app_en,
                 json.dumps(spec_tables, ensure_ascii=False) if spec_tables else None,
                 json.dumps(gallery, ensure_ascii=False) if gallery else None,
                 prod["cat_id"], NOW, NOW),
            )
            pid = cur.lastrowid
            for i, d in enumerate(documents):
                cur.execute(
                    """INSERT INTO Document (type, nameTr, nameEn, url, urlEn, "order", productId, createdAt)
                       VALUES (?,?,?,?,?,?,?,?)""",
                    (d["type"], d["nameTr"], d["nameEn"], d["url"], d["urlEn"], i, pid, NOW),
                )
        else:
            # dry-run önizleme
            print(f"  kategori id: {prod['cat_id']}, görsel TR/EN: {len(tr_list)}/{len(en_list)}, "
                  f"tablo: {len(spec_tables)}, doküman: {len(documents)}")
            if desc_tr:
                print("  --- descTr ---")
                print("  " + desc_tr.replace("\n", "\n  ")[:600])
            if feat_tr:
                print("  --- featuresTr ---")
                print("  " + feat_tr.replace("\n", "\n  ")[:400])
            for d in documents:
                print(f"  DOC [{d['type']}] {d['nameTr']} | {d['url']} | en={d['urlEn']}")

        report["products"].append(entry)

    if not dry:
        con.commit()
        # DB'de referansı olmayan artık upload dosyalarını temizle
        referenced = set()
        for (mtr, men, atr, aen, gal) in con.execute(
                "SELECT mainImageTr, mainImageEn, appImageTr, appImageEn, gallery FROM Product"):
            for u in (mtr, men, atr, aen):
                if u: referenced.add(u.split("/")[-1])
            if gal:
                for g in json.loads(gal):
                    for u in (g.get("url"), g.get("urlEn")):
                        if u: referenced.add(u.split("/")[-1])
        for (u, ue) in con.execute("SELECT url, urlEn FROM Document"):
            referenced.add(u.split("/")[-1])
            if ue: referenced.add(ue.split("/")[-1])
        removed = 0
        for f in UPLOADS.iterdir():
            if f.is_file() and f.name not in referenced:
                f.unlink()
                removed += 1
        report["deleted"]["orphan_uploads"] = removed
    con.close()

    out = PROJECT / "scripts" / "yenitam-import" / ("report-dry.json" if dry else "report.json")
    out.write_text(json.dumps(report, ensure_ascii=False, indent=1))
    print(f"\nRapor: {out}")
    print(f"Uyarı sayısı: {len(report['warnings'])}")

if __name__ == "__main__":
    main()
