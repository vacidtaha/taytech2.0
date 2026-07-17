# -*- coding: utf-8 -*-
"""Ürün içerik toplama klasör iskeletini masaüstüne kurar.

23 mevcut + 34 eksik ürün için kategori ağacına göre klasörler ve
her alt klasörde OKUBENI talimat dosyaları üretir.
Tek seferlik yardımcı script.
"""
import csv
import json
import re
import sqlite3
from pathlib import Path

ROOT = Path.home() / "Desktop" / "TAYTECH-URUN-ICERIK"
DB = Path(__file__).resolve().parent.parent / "taytech.db"
EKSIK = Path(__file__).resolve().parent.parent / "prisma/seed-data/eksik-urunler.json"

# Dosya sistemi için güvenli ad (Türkçe karakterler kalır, ®/: gibi işaretler temizlenir)
def safe(name: str) -> str:
    s = name.replace("®", "").replace("/", "-").replace(":", " -")
    s = re.sub(r"\s+", " ", s).strip()
    return s

# ---------------------------------------------------------------- veriler
con = sqlite3.connect(DB)
cur = con.cursor()

cats = {r[0]: (r[1], r[2]) for r in cur.execute(
    "SELECT id, nameTr, parentId FROM Category")}

def cat_path(cid):
    parts = []
    while cid is not None:
        name, parent = cats[cid]
        parts.append(safe(name))
        cid = parent
    return list(reversed(parts))

products = []  # (kategori yolu, ad_tr, ad_en, sitede_var_mi)
for pid, tr, en, cid in cur.execute(
        "SELECT id, nameTr, nameEn, categoryId FROM Product ORDER BY id"):
    products.append((cat_path(cid), safe(tr), en, True))

slug_to_cat = {r[0]: r[1] for r in cur.execute("SELECT slug, id FROM Category")}
con.close()

eksik = json.loads(EKSIK.read_text())
for item in eksik:
    parts = [p for p in item["href"].split("/") if p and p != "urunler"]
    yol = []
    for s in parts[:-1]:
        if s in slug_to_cat:
            yol = cat_path(slug_to_cat[s])
    products.append((yol, safe(item["tr"]), item["en"], False))

# ---------------------------------------------------------------- talimatlar
ANA_TALIMAT = """TAYTECH ÜRÜN İÇERİK TOPLAMA KLASÖRÜ — NASIL DOLDURULUR?
=========================================================

Bu klasörde her ürün için bir klasör var. Sorumlu olduğunuz ürünün
klasörünü açın ve içindeki 6 alt klasörü aşağıdaki kurallara göre doldurun.
Her alt klasörün içinde de kısa bir OKUBENI talimat dosyası bulunur.

GENEL KURALLAR
--------------
1. HER İÇERİĞİN TÜRKÇESİ VE İNGİLİZCESİ AYRI DOSYALAR HALİNDE KONULACAK.
   Örnek: aciklama-tr.txt ve aciklama-en.txt — tek dosyada iki dil OLMAZ.
2. Fotoğraflar: PNG veya JPG, mümkünse beyaz/sade fonlu, en az 1200 px genişlik.
3. Tablolar: Excel (.xlsx) veya CSV. İlk satır başlık satırı olmalı.
4. Dokümanlar: PDF formatında.
5. Dosya adlarında Türkçe karakter kullanabilirsiniz, sorun değil.
6. Bir bilgi ürün için geçerli değilse (örn. uygulama fotoğrafı yoksa)
   klasörü boş bırakın ama OKUBENI dosyasını silmeyin.
7. Emin olmadığınız bilgiyi tahmin etmeyin; klasörün içine
   "SORU.txt" adında bir not bırakın.

ALT KLASÖRLER
-------------
1-urun-fotograflari  : Ürünün kendisinin fotoğrafları (1 veya daha fazla).
                       İngilizce sitede FARKLI görsel kullanılacaksa adının
                       sonuna -en ekleyin (örn. panel-on-en.png).
2-uygulama-fotografi : Ürünün sahada / tesiste kullanım fotoğrafı (1 adet).
3-aciklama           : Ürünün tanıtım/açıklama metni.
                       TÜRKÇE ve İNGİLİZCE AYRI DOSYALAR:
                       aciklama-tr.txt ve aciklama-en.txt (.docx da olur)
4-teknik-ozellikler  : Öne çıkan teknik özelliklerin madde madde listesi.
                       TÜRKÇE ve İNGİLİZCE AYRI DOSYALAR:
                       ozellikler-tr.txt ve ozellikler-en.txt
5-teknik-tablo       : Teknik özellik tabloları (Excel veya CSV).
                       TÜRKÇE ve İNGİLİZCE AYRI DOSYALAR:
                       tablo-tr.xlsx ve tablo-en.xlsx
                       (birden fazla tablo varsa tablo2-tr, tablo2-en...)
6-dokumanlar         : Katalog, kullanım kılavuzu, sertifika, CAD çizimi (PDF).
                       Dosya adına türünü ve dilini yazın: katalog-tr.pdf,
                       katalog-en.pdf, kilavuz-tr.pdf, sertifika.pdf, cad.pdf

Doldurma durumunu TAKIP-LISTESI.csv dosyasından işaretleyebilirsiniz
(Excel ile açılır).
"""

SUB_NOTES = {
    "1-urun-fotograflari": (
        "Buraya ürünün kendi fotoğraflarını koyun (PNG/JPG, min 1200px, sade fon).\n"
        "İngilizce sitede farklı görsel gerekiyorsa dosya adının sonuna -en ekleyin."
    ),
    "2-uygulama-fotografi": (
        "Buraya ürünün sahada/tesiste kullanılırken çekilmiş 1 fotoğrafını koyun.\n"
        "Yoksa boş bırakın."
    ),
    "3-aciklama": (
        "Ürünün tanıtım/açıklama metnini buraya koyun.\n"
        "\n"
        "TÜRKÇE ve İNGİLİZCE AYRI DOSYALAR halinde olmalı:\n"
        "- aciklama-tr.txt  (Türkçe metin)\n"
        "- aciklama-en.txt  (İngilizce metin)\n"
        "\n"
        ".txt yerine Word (.docx) de olabilir."
    ),
    "4-teknik-ozellikler": (
        "Ürünün öne çıkan teknik özelliklerini madde madde buraya koyun.\n"
        "Her satıra bir özellik yazın.\n"
        "\n"
        "TÜRKÇE ve İNGİLİZCE AYRI DOSYALAR halinde olmalı:\n"
        "- ozellikler-tr.txt  (Türkçe liste)\n"
        "- ozellikler-en.txt  (İngilizce liste)"
    ),
    "5-teknik-tablo": (
        "Teknik özellik tablolarını buraya koyun (Excel .xlsx veya CSV).\n"
        "İlk satır başlık satırı olmalı.\n"
        "\n"
        "TÜRKÇE ve İNGİLİZCE AYRI DOSYALAR halinde olmalı:\n"
        "- tablo-tr.xlsx  (Türkçe tablo)\n"
        "- tablo-en.xlsx  (İngilizce tablo)\n"
        "\n"
        "Birden fazla tablo varsa: tablo2-tr.xlsx, tablo2-en.xlsx diye devam edin."
    ),
    "6-dokumanlar": (
        "PDF dokümanları buraya koyun. Dosya adına türünü ve dilini yazın:\n"
        "katalog-tr.pdf, katalog-en.pdf, kilavuz-tr.pdf, kilavuz-en.pdf,\n"
        "sertifika.pdf, cad.pdf"
    ),
}

# ---------------------------------------------------------------- kurulum
rows = []
for yol, ad_tr, ad_en, sitede in sorted(products, key=lambda x: (x[0], x[1])):
    pdir = ROOT.joinpath(*yol, ad_tr)
    for sub, note in SUB_NOTES.items():
        d = pdir / sub
        d.mkdir(parents=True, exist_ok=True)
        (d / "OKUBENI.txt").write_text(note + "\n", encoding="utf-8")
    (pdir / "URUN-BILGI.txt").write_text(
        f"Ürün adı (TR): {ad_tr}\n"
        f"Ürün adı (EN): {ad_en}\n"
        f"Kategori: {' / '.join(yol) if yol else '-'}\n"
        f"Sitede şu an: {'EKLİ (içerik yeniden toplanacak)' if sitede else 'YOK (yeni eklenecek)'}\n\n"
        "İngilizce ürün adı yanlışsa bu dosyada düzeltin.\n",
        encoding="utf-8")
    rows.append([" / ".join(yol), ad_tr, ad_en,
                 "ekli" if sitede else "yok",
                 "", "", "", "", "", "", ""])

(ROOT / "0-NASIL-DOLDURULUR.txt").write_text(ANA_TALIMAT, encoding="utf-8")
with open(ROOT / "TAKIP-LISTESI.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f, delimiter=";")
    w.writerow(["Kategori", "Ürün (TR)", "Ürün (EN)", "Sitede",
                "Sorumlu", "Fotoğraflar", "Uygulama Foto", "Açıklama",
                "Teknik Özellikler", "Tablolar", "Dokümanlar"])
    w.writerows(rows)

print(f"Toplam ürün klasörü: {len(rows)}")
print(f"Konum: {ROOT}")
