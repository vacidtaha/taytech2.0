/**
 * Side menüde başlık ile önizleme fotoğrafı arasında gösterilen kısa
 * tanıtım metinleri. Anahtar: kategori veya ürün slug'ı.
 * Kategorilerde "bu ne?", ürünlerde "diğerlerinden farkı ne?" sorusuna
 * tek cümlelik yanıt verir.
 */
export const menuDescriptions: Record<string, { tr: string; en: string }> = {
  // ── Isı Ağları ────────────────────────────────────────────────
  "isi-istasyonlari": {
    tr: "Daireye özel ısıtma ve sıcak su sağlayan kompakt üniteler.",
    en: "Compact units providing per-dwelling heating and hot water.",
  },
  "smarthexa-serisi": {
    tr: "Elektronik kontrollü, en yüksek verimli akıllı seri.",
    en: "Electronically controlled series with the highest efficiency.",
  },
  "indirect-smarthexa": {
    tr: "Isıtma devresi eşanjörle ayrılan (indirekt) modeller.",
    en: "Models with the heating circuit separated by a heat exchanger.",
  },
  "direct-smarthexa": {
    tr: "Isıtma devresi doğrudan beslenen (direkt) modeller.",
    en: "Models with a directly supplied heating circuit.",
  },
  "hydrohexa-serisi": {
    tr: "Elektrik gerektirmeyen hidrolik ve termostatik kontrol.",
    en: "Hydraulic and thermostatic control with no electricity needed.",
  },
  "indirect-hydrohexa": {
    tr: "Isıtma devresi eşanjörle ayrılan (indirekt) modeller.",
    en: "Models with the heating circuit separated by a heat exchanger.",
  },
  "direct-hydrohexa": {
    tr: "Isıtma devresi doğrudan beslenen (direkt) modeller.",
    en: "Models with a directly supplied heating circuit.",
  },
  "thermohexa-serisi": {
    tr: "Sıcaklığa bağlı termostatik kontrollü ekonomik seri.",
    en: "Economical series with temperature-based thermostatic control.",
  },
  "indirect-thermohexa": {
    tr: "Isıtma devresi eşanjörle ayrılan (indirekt) modeller.",
    en: "Models with the heating circuit separated by a heat exchanger.",
  },
  "direct-thermohexa": {
    tr: "Isıtma devresi doğrudan beslenen (direkt) modeller.",
    en: "Models with a directly supplied heating circuit.",
  },
  "hydro-em-serisi": {
    tr: "Sıcak su hazırlama ve primer dengeleme odaklı seri.",
    en: "Series focused on hot water preparation and primary balancing.",
  },
  "indirect-hydro-em": {
    tr: "Isıtma devresi eşanjörle ayrılan (indirekt) modeller.",
    en: "Models with the heating circuit separated by a heat exchanger.",
  },
  "direct-hydro-em": {
    tr: "Isıtma devresi doğrudan beslenen (direkt) modeller.",
    en: "Models with a directly supplied heating circuit.",
  },
  "endustriyel-isi-istasyonlari": {
    tr: "Yüksek kapasiteli endüstriyel ısı transfer istasyonları.",
    en: "High-capacity industrial heat transfer stations.",
  },
  "bolgesel-isitma-istasyonlari": {
    tr: "Bölgesel ısıtma şebekeleri için merkezi istasyonlar.",
    en: "Central stations for district heating networks.",
  },
  "bolgesel-sogutma-istasyonlari": {
    tr: "Bölgesel soğutma şebekeleri için merkezi istasyonlar.",
    en: "Central stations for district cooling networks.",
  },
  "sayac-istasyonlari": {
    tr: "Daire girişinde ölçüm ve dağıtım yapan istasyonlar.",
    en: "Stations for metering and distribution at the dwelling entry.",
  },
  "manyetik-filtreler": {
    tr: "Tesisattaki demir tozu ve manyetiti tutan filtreler.",
    en: "Filters that capture iron dust and magnetite in the system.",
  },
  aksesuarlar: {
    tr: "İstasyon montajını tamamlayan bağlantı ve vana ekipmanları.",
    en: "Connection and valve equipment completing station installation.",
  },
  "ilk-montaj-kiti": {
    tr: "İlk montaj aşamasında kullanılan bağlantı seti.",
    en: "Connection set used during first installation.",
  },
  "baglanti-kutulari": {
    tr: "İstasyon bağlantıları için montaj kutuları.",
    en: "Mounting boxes for station connections.",
  },
  "re-sirkulasyon-kitleri": {
    tr: "Sıcak suyun hatta sürekli sıcak kalmasını sağlar.",
    en: "Keeps hot water constantly warm in the line.",
  },
  "fark-basinc-vanasi": {
    tr: "Devreler arasındaki basınç farkını dengeler.",
    en: "Balances differential pressure between circuits.",
  },
  "termal-bypass-vanasi": {
    tr: "Hat sıcaklığını koruyarak bekleme süresini azaltır.",
    en: "Maintains line temperature to reduce waiting time.",
  },
  kabin: {
    tr: "İstasyonlar için koruyucu montaj kabinleri.",
    en: "Protective mounting cabinets for stations.",
  },
  sayaclar: {
    tr: "Isıtma, soğutma ve su tüketimini ölçen sayaçlar.",
    en: "Meters measuring heating, cooling and water consumption.",
  },
  "isitma-kalorimetresi": {
    tr: "Daire bazlı ısıtma enerjisi tüketimini ölçer.",
    en: "Measures per-dwelling heating energy consumption.",
  },
  "sogutma-kalorimetresi": {
    tr: "Soğutma enerjisi tüketimini ölçer.",
    en: "Measures cooling energy consumption.",
  },
  "su-sayaci": {
    tr: "Sıcak ve soğuk su tüketimini ölçer.",
    en: "Measures hot and cold water consumption.",
  },
  "on-odemeli-sayaclar": {
    tr: "Kontörlü, ön ödemeli tüketim ölçüm çözümleri.",
    en: "Prepaid, credit-based consumption metering solutions.",
  },
  "on-odemeli-kalorimetre": {
    tr: "Ön ödemeli ısı enerjisi sayacı.",
    en: "Prepaid heat energy meter.",
  },
  "on-odemeli-su-sayaci": {
    tr: "Ön ödemeli su sayacı çözümü.",
    en: "Prepaid water meter solution.",
  },

  // ── Motor Kontrol Panoları ────────────────────────────────────
  "elektronik-kontrol-panelleri": {
    tr: "Pompa sistemleri için mikroişlemcili akıllı kontrol çözümleri.",
    en: "Microprocessor-based smart control solutions for pump systems.",
  },
  "smart-serisi": {
    tr: "Farklı pompa uygulamaları için akıllı kontrol panosu ailesi.",
    en: "Smart control panel family for various pump applications.",
  },
  "frekans-invertor-serisi": {
    tr: "Değişken frekansla yol verme; enerji tasarrufu ve hassas kontrol.",
    en: "Variable-frequency starting for energy savings and precise control.",
  },
  "soft-starter-serisi": {
    tr: "Yumuşak kalkış ile motoru ve tesisatı darbelerden korur.",
    en: "Soft starting protects the motor and pipework from surges.",
  },
  "elektro-mekanik-paneller": {
    tr: "Kontaktörlü klasik yol verme çözümleri.",
    en: "Classic contactor-based motor starting solutions.",
  },
  "yangin-pompa-kontrol-panolari": {
    tr: "Yangın pompaları için standartlara uygun kontrol panoları.",
    en: "Standards-compliant control panels for fire pumps.",
  },
  "nfpa-ul-fm-serisi": {
    tr: "NFPA 20 uyumlu, UL & FM onaylı yangın pompa kontrolü.",
    en: "NFPA 20 compliant, UL & FM approved fire pump control.",
  },
  "nfpa-dizel-motor-kontrol-panosu": {
    tr: "Dizel tahrikli yangın pompaları için kontrol panosu.",
    en: "Controller for diesel-driven fire pumps.",
  },
  "nfpa-elektrik-motor-kontrol-panosu": {
    tr: "Elektrik motorlu yangın pompaları için kontrol panosu.",
    en: "Controller for electric-motor fire pumps.",
  },
  "nfpa-jokey-pompa-kontrol-panosu": {
    tr: "Hat basıncını koruyan jokey pompalar için kontrol.",
    en: "Control for jockey pumps that maintain line pressure.",
  },
  "en-serisi": {
    tr: "EN 12845 standardına uygun yangın pompa kontrol serisi.",
    en: "Fire pump control series compliant with EN 12845.",
  },
  "dizel-serisi-en-12845": {
    tr: "EN 12845 uyumlu dizel pompa kontrol panoları.",
    en: "EN 12845 compliant diesel pump controllers.",
  },
  "elektrik-serisi-en-12845": {
    tr: "EN 12845 uyumlu elektrikli pompa kontrol panoları.",
    en: "EN 12845 compliant electric pump controllers.",
  },
  "jokey-serisi": {
    tr: "Sistem basıncını dengeleyen jokey pompa kontrolü.",
    en: "Jockey pump control that stabilises system pressure.",
  },

  // ── Enerji Yönetim Platformu ──────────────────────────────────
  "yazilim-platformu": {
    tr: "Uzaktan izleme, faturalandırma ve raporlama yazılımı.",
    en: "Software for remote monitoring, billing and reporting.",
  },
  "veri-yonetim-cihazlari": {
    tr: "Saha verilerini toplayan haberleşme cihazları.",
    en: "Communication devices that collect field data.",
  },
  "m-bus-converter": {
    tr: "M-Bus hattındaki sayaç verilerini merkeze aktarır.",
    en: "Transfers meter data from the M-Bus line to the centre.",
  },
  "ttsmart-box": {
    tr: "İstasyon verilerini uzaktan okuma için toplar.",
    en: "Collects station data for remote reading.",
  },
  "data-logger": {
    tr: "Tüketim verilerini kaydeder ve arşivler.",
    en: "Records and archives consumption data.",
  },
  gateway: {
    tr: "Sahadaki cihazları merkeze bağlayan ağ geçidi.",
    en: "A gateway connecting field devices to the centre.",
  },

  // ── Ürünler: Smart Serisi ─────────────────────────────────────
  "smart-booster": {
    tr: "Hidrofor sistemleri için 2 pompaya kadar akıllı kontrol.",
    en: "Smart control for booster sets with up to 2 pumps.",
  },
  "smart-bore-hole": {
    tr: "Derin kuyu pompaları için 2 pompaya kadar kontrol.",
    en: "Control for deep well pumps with up to 2 pumps.",
  },
  "smart-box": {
    tr: "Tek fazlı pompalar için kompakt kontrol panosu.",
    en: "Compact control panel for single-phase pumps.",
  },
  "smart-exclusive": {
    tr: "4 pompaya kadar sistemler için üst seviye kontrol.",
    en: "Advanced control for systems with up to 4 pumps.",
  },
  "smart-grinder": {
    tr: "Parçalayıcılı atık su pompaları için kontrol.",
    en: "Control for grinder wastewater pumps.",
  },
  "smart-wastewater": {
    tr: "Atık su pompaları için 2 pompaya kadar kontrol.",
    en: "Control for wastewater pumps with up to 2 pumps.",
  },

  // ── Ürünler: Frekans İnvertör Serisi ──────────────────────────
  "fxa-serisi": {
    tr: "Frekans invertörlü, 4 motora kadar gelişmiş kontrol.",
    en: "Frequency-inverter control for up to 4 motors.",
  },
  "fxs-serisi": {
    tr: "Değişken frekans kontrollü kompakt pano serisi.",
    en: "Compact panel series with variable-frequency control.",
  },

  // ── Ürünler: Elektro Mekanik Paneller ─────────────────────────
  "direkt-baslatma": {
    tr: "Doğrudan yol verme ile 4 pompaya kadar kontrol.",
    en: "Direct-on-line starting for up to 4 pumps.",
  },
  "yildiz-ucgen-baslatma": {
    tr: "Yıldız-üçgen yol verme ile 4 pompaya kadar kontrol.",
    en: "Star-delta starting for up to 4 pumps.",
  },

  // ── Ürünler: SmartHexa ────────────────────────────────────────
  "indirect-smarthexa-dhw-sh": {
    tr: "Sıcak su + ısıtma; elektronik kontrollü indirekt model.",
    en: "Hot water + heating; electronically controlled indirect model.",
  },
  "indirect-smarthexa-sh": {
    tr: "Yalnızca ısıtma için elektronik kontrollü model.",
    en: "Electronically controlled model for space heating only.",
  },
  "direct-smarthexa-dhw": {
    tr: "Yalnızca kullanım sıcak suyu üretimi için.",
    en: "For domestic hot water production only.",
  },
  "direct-smarthexa-rh": {
    tr: "Sıcak su + radyatörlü ısıtma için direkt model.",
    en: "Direct model for hot water + radiator heating.",
  },
  "direct-smarthexa-ufh": {
    tr: "Sıcak su + yerden ısıtma için direkt model.",
    en: "Direct model for hot water + underfloor heating.",
  },

  // ── Ürünler: HydroHexa ────────────────────────────────────────
  "indirect-hydrohexa-dhw-sh": {
    tr: "Sıcak su + ısıtma; elektriksiz hidrolik kontrol.",
    en: "Hot water + heating; electricity-free hydraulic control.",
  },
  "direct-hydrohexa-dhw": {
    tr: "Yalnızca sıcak su; kireçlenmeye dirençli soğuk eşanjör.",
    en: "Hot water only; scale-resistant cold heat exchanger.",
  },
  "direct-hydrohexa-rh": {
    tr: "Sıcak su + radyatörlü ısıtma; hidrolik kontrol.",
    en: "Hot water + radiator heating; hydraulic control.",
  },
  "direct-hydrohexa-ufh": {
    tr: "Sıcak su + yerden ısıtma; hidrolik kontrol.",
    en: "Hot water + underfloor heating; hydraulic control.",
  },

  // ── Ürünler: ThermoHexa ───────────────────────────────────────
  "indirect-thermohexa-dhw-sh": {
    tr: "Sıcak su + ısıtma; termostatik kontrollü indirekt model.",
    en: "Hot water + heating; thermostatically controlled indirect model.",
  },
  "indirect-thermohexa-sh": {
    tr: "Yalnızca ısıtma için termostatik kontrollü model.",
    en: "Thermostatically controlled model for heating only.",
  },
  "direct-thermohexa-dhw": {
    tr: "Yalnızca sıcak su üretimi için termostatik model.",
    en: "Thermostatic model for hot water production only.",
  },
  "direct-thermohexa-rh": {
    tr: "Sıcak su + radyatörlü ısıtma; termostatik kontrol.",
    en: "Hot water + radiator heating; thermostatic control.",
  },
  "direct-thermohexa-ufh": {
    tr: "Sıcak su + yerden ısıtma; termostatik kontrol.",
    en: "Hot water + underfloor heating; thermostatic control.",
  },

  // ── Ürünler: Hydro EM ─────────────────────────────────────────
  "indirect-hydro-em-dhw-sh": {
    tr: "Sıcak su + ısıtma; primer dengelemeli indirekt model.",
    en: "Hot water + heating; indirect model with primary balancing.",
  },
  "direct-hydro-em-rh": {
    tr: "Sıcak su + radyatörlü ısıtma; direkt Hydro EM.",
    en: "Hot water + radiator heating; direct Hydro EM.",
  },
  "direct-hydro-em-ufh": {
    tr: "Sıcak su + yerden ısıtma; direkt Hydro EM.",
    en: "Hot water + underfloor heating; direct Hydro EM.",
  },

  // ── Ürünler: Manyetik Filtreler ───────────────────────────────
  irontrap: {
    tr: "Tesisatı demir tozu ve manyetitten koruyan manyetik filtre.",
    en: "Magnetic filter protecting the system from iron dust and magnetite.",
  },
  ironinox: {
    tr: "Paslanmaz gövdeli, endüstriyel tip manyetik filtre.",
    en: "Industrial-type magnetic filter with a stainless steel body.",
  },
};
