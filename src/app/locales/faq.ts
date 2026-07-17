import type { Locale } from "./contact";

export const faqTranslations: Record<Locale, Record<string, string>> = {
  TR: {
    "sss.bilgiMerkezi": "Bilgi Merkezi",
    "sss.title": "Sıkça Sorulan Sorular",
    "sss.desc":
      "Taytech ürünleri, çözümleri ve hizmetleri hakkında en çok merak edilen soruların yanıtları.",
    "sss.kategoriler": "Kategoriler",
    "sss.tumu": "Tümü",
    "sss.sorunuz": "Sorunuz mu var?",
    "sss.sorunuzDesc": "Aradığınız yanıtı bulamadıysanız bize ulaşın.",
    "sss.iletisim": "İletişime Geç →",

    /* ---------------- Kategori adları ---------------- */
    "sss.cat.genel": "Genel",
    "sss.cat.isi": "Isı İstasyonları",
    "sss.cat.pano": "Motor Kontrol Panoları",
    "sss.cat.filtre": "Manyetik Filtreler",
    "sss.cat.enerji": "Enerji Yönetimi & Cloud",
    "sss.cat.kurulum": "Kurulum & Devreye Alma",
    "sss.cat.destek": "Teknik Destek & Garanti",
    "sss.cat.satis": "Satış & Sipariş",

    /* ---------------- Genel ---------------- */
    "sss.g1.q": "Taytech ne iş yapar?",
    "sss.g1.a":
      "Taytech Enerji Teknolojileri San. ve Tic. A.Ş., ısıtma-soğutma kontrol sistemleri, akıllı motor kontrol panoları, ısı istasyonları, elektronik kontrolörler, IRONTRAP® manyetik filtreler ve Taytech Cloud uzaktan izleme platformu alanlarında uçtan uca mühendislik çözümleri sunan bir Türk teknoloji şirketidir.",
    "sss.g2.q": "Taytech'in üretim tesisleri nerededir?",
    "sss.g2.a":
      "Tüm üretim faaliyetlerimiz, Gebze Plastikçiler Organize Sanayi Bölgesi'ndeki 5.600 m² toplam alana sahip modern tesislerimizde gerçekleştirilmektedir. Tesisimiz 4.750 m² üretim parkuru ve 860 m² Ar-Ge merkezinden oluşmaktadır.",
    "sss.g3.q": "Taytech hangi sertifikalara sahiptir?",
    "sss.g3.a":
      "Taytech, ISO 9001:2015 Kalite Yönetimi, ISO 14001:2015 Çevre Yönetimi ve ISO 45001:2018 İş Sağlığı ve Güvenliği sertifikalarına sahiptir. Tüm üretim süreçlerimiz bu standartlara uygun şekilde yürütülmektedir.",
    "sss.g4.q": "Taytech'in merkezi nerededir?",
    "sss.g4.a":
      "Şirket merkezimiz ve fabrikamız Kocaeli Gebze'dedir: İnönü Mahallesi, Gebze Plastikçiler OSB, Atatürk Bulvarı No:7/2, Gebze/Kocaeli. Ayrıca Birleşik Krallık'ta Taytech Technologies Ltd. (Londra) ofisimiz bulunmaktadır.",
    "sss.g5.q": "Taytech yurt dışına satış yapıyor mu?",
    "sss.g5.a":
      "Evet. Londra merkezli Taytech Technologies Ltd. ofisimiz üzerinden başta Birleşik Krallık olmak üzere uluslararası pazarlara ürün ve mühendislik hizmeti sunuyoruz. İhracat projeleriniz için ekibimizle iletişime geçebilirsiniz.",

    /* ---------------- Isı İstasyonları ---------------- */
    "sss.h1.q": "Isı istasyonu nedir?",
    "sss.h1.a":
      "Isı istasyonu, merkezi ısıtma sisteminden (bölgesel ısıtma hattı veya bina kazan dairesi) gelen ısı enerjisini her daireye ayrı ayrı dağıtan kompakt bir ünitedir. Her dairenin kendi ısıtma ve sıcak su kontrolünü yapmasını sağlar; böylece daire bazlı ölçüm, konfor ve enerji tasarrufu bir arada sunulur.",
    "sss.h2.q": "Direct ve Indirect ısı istasyonu arasındaki fark nedir?",
    "sss.h2.a":
      "Direct (doğrudan) istasyonlarda merkezi sistem suyu dairenin ısıtma devresinde doğrudan dolaşır; ısıtma tarafında eşanjör yoktur. Indirect (dolaylı) istasyonlarda ise daire devresi, plakalı ısı eşanjörü ile merkezi sistemden hidrolik olarak tamamen ayrılır. Indirect sistemler yüksek binalarda basınç bölgelerini ayırmak ve daire tesisatını merkezi sistemdeki kirlilikten korumak için tercih edilir.",
    "sss.h3.q": "DHW, RH, UFH ve SH kısaltmaları ne anlama gelir?",
    "sss.h3.a":
      "Bunlar istasyonun görev tipini belirtir: DHW (Domestic Hot Water) kullanım sıcak suyu üretimi, RH (Radiator Heating) radyatörlü ısıtma, UFH (Underfloor Heating) yerden ısıtma, SH (Space Heating) genel hacim ısıtması demektir. Örneğin \"Indirect SmartHexa DHW-SH\", hem sıcak su üreten hem de ısıtma yapan dolaylı tip istasyondur.",
    "sss.h4.q": "SmartHexa, HydroHexa ve ThermoHexa serileri arasındaki fark nedir?",
    "sss.h4.a":
      "SmartHexa, sıcaklık-basınç-akışı birçok noktadan izleyen elektronik kontrol sistemine ve orantılı motorlu vanalara sahip en gelişmiş seridir. HydroHexa, elektrik gerektirmeyen orantısal (hidrolik) kontrol prensibiyle çalışan ekonomik ve güvenilir bir seridir. ThermoHexa ise termostatik kontrol elemanlarıyla çalışan, sade ve bakımı kolay bir çözümdür. Proje bütçenize ve kontrol hassasiyeti ihtiyacınıza göre seçim yapılır.",
    "sss.h5.q": "Isı istasyonu hangi bina tiplerine uygundur?",
    "sss.h5.a":
      "Merkezi ısıtma sistemine sahip tüm binalarda kullanılabilir: toplu konutlar, rezidanslar, öğrenci yurtları, oteller, hastaneler ve karma kullanımlı projeler. Bölgesel ısıtma (district heating) ağına bağlı şehir projelerinde de daire bağlantı noktası olarak görev yapar.",
    "sss.h6.q": "Isı istasyonlarında hangi malzemeler kullanılıyor?",
    "sss.h6.a":
      "Isı eşanjörleri ve borulamada paslanmaz çelik kullanılır. Bu, hem uzun servis ömrü hem de kullanım sıcak suyunun hijyenik şekilde hazırlanması anlamına gelir. Vanalar ve kontrol elemanları da endüstriyel sınıf bileşenlerden seçilir.",
    "sss.h7.q": "Isı istasyonu kullanım sıcak suyunu nasıl hazırlar?",
    "sss.h7.a":
      "İstasyon, musluk açıldığında plakalı ısı eşanjörü üzerinden merkezi sistem enerjisiyle soğuk suyu anında ısıtır; depolama yapılmaz. Anlık (instantaneous) üretim sayesinde lejyonella riski en aza iner, sıcak su beklemeden ve hijyenik olarak elde edilir. DHW öncelikli modellerde sıcak su talebi ısıtmaya göre önceliklidir.",
    "sss.h8.q": "Dış hava kompanzasyonu nedir, ısı istasyonlarına eklenebilir mi?",
    "sss.h8.a":
      "Dış hava kompanzasyonu, ısıtma gidiş suyu sıcaklığının dış ortam sıcaklığına göre otomatik ayarlanmasıdır. SmartHexa gibi elektronik kontrollü istasyonlara opsiyonel olarak entegre edilebilir ve binanın genel enerji verimliliğini belirgin şekilde artırır.",
    "sss.h9.q": "Isı istasyonlarında tüketim ölçümü (kalorimetre) yapılabiliyor mu?",
    "sss.h9.a":
      "Evet. İstasyonlara ısı sayacı (kalorimetre) entegre edilerek her dairenin gerçek enerji tüketimi ölçülür. M-Bus altyapısı ile sayaç verileri merkezi olarak toplanır; ön ödemeli kalorimetre çözümümüzle tüketim ödemesi peşin bakiye üzerinden de yönetilebilir.",
    "sss.h10.q": "Bölgesel ısıtma (district heating) projeleri için hangi ürünleri sunuyorsunuz?",
    "sss.h10.a":
      "Bölgesel ısıtma istasyonlarımız, şehir ısıtma ağından binaya veya daireye enerji aktaran ünitelerdir. Meter Tech W1 ölçüm ünitesi, ilk montaj kiti, ısıtma kalorimetresi ve ön ödemeli kalorimetre ürünlerimizle birlikte uçtan uca bölgesel ısıtma altyapısı kurulabilir.",

    /* ---------------- Motor Kontrol Panoları ---------------- */
    "sss.p1.q": "Motor kontrol panosu nedir, ne işe yarar?",
    "sss.p1.a":
      "Motor kontrol panosu, pompa ve motor sistemlerini otomatik olarak başlatan, durduran, koruyan ve izleyen elektrik/elektronik kontrol ünitesidir. Temiz su basınçlandırma, pis su tahliye, doldurma-boşaltma ve yangın pompası gibi uygulamalarda motorların güvenli ve verimli çalışmasını sağlar.",
    "sss.p2.q": "Hangi yol verme yöntemlerini sunuyorsunuz?",
    "sss.p2.a":
      "Dört ana yöntem sunuyoruz: Direct Start (doğrudan yol verme), Yıldız-Üçgen (Star-Delta) yol verme, Soft Starter ve Frekans İnvertörü (FxA / FxS serisi) ile değişken hızlı sürüş. Motor gücü, kalkış akımı kısıtları ve enerji verimliliği hedefine göre doğru yöntem projelendirme aşamasında belirlenir.",
    "sss.p3.q": "Frekans invertörlü (FxA / FxS) panoların avantajı nedir?",
    "sss.p3.a":
      "Frekans invertörlü panolar, motor devrini talebe göre değiştirerek sabit basınç sağlar ve enerji tüketimini önemli ölçüde düşürür. 3 fazlı 4 motora kadar sistemleri sürebilir; LCD ekran üzerinden kolay ayar, fabrika montajlı motor koruma devre kesicisi ve 3G/Wi-Fi modülü ile uzaktan izleme-kontrol imkânı sunar.",
    "sss.p4.q": "Smart Serisi panolar nelerdir?",
    "sss.p4.a":
      "Smart Serisi, mikroişlemcili kompakt kontrol panolarıdır: Smart Hidrofor (basınçlandırma), Smart Box (doldurma/boşaltma), Smart Derin Kuyu, Smart Atık Su, Smart Grinder ve Smart Exclusive. Tümünde LCD ekran üzerinden parametre ayarı, olay/mesaj kaydı ve opsiyonel 3G/Wi-Fi ile uzaktan yönetim bulunur.",
    "sss.p5.q": "Panolarınız kaç pompaya kadar kontrol edebilir?",
    "sss.p5.a":
      "Seriye göre değişir: Smart Serisi 2 pompaya kadar, Direct Start ve frekans invertörlü FxA/FxS serileri ise 1 veya 3 faz motorlarla 4 pompaya kadar aynı anda kontrol edebilir. Daha büyük konfigürasyonlar için proje bazlı özel pano üretimi yapıyoruz.",
    "sss.p6.q": "Yangın pompası kontrol panolarınız hangi standartlara uygun?",
    "sss.p6.a":
      "İki ayrı seri üretiyoruz: NFPA 20 / UL & FM gerekliliklerine uygun elektrik ve dizel motor kontrol panoları ile EN 12845 standardına uygun elektrik ve dizel serileri. Böylece hem Amerikan hem Avrupa normlarına göre projelendirilen yangın söndürme sistemlerine çözüm sunuyoruz.",
    "sss.p7.q": "Panoları uzaktan izlemek mümkün mü?",
    "sss.p7.a":
      "Evet. 3G/Wi-Fi modülü bulunan panolarımız Taytech Cloud platformuna bağlanır; sistemi uzaktan işletebilir, anlık verileri görüntüleyebilir, parametre değiştirebilir ve arıza bildirimlerini anında alabilirsiniz.",
    "sss.p8.q": "Şamandıra, basınç sensörü gibi saha elemanları panoya bağlanabilir mi?",
    "sss.p8.a":
      "Evet. Panolarımız şamandıra, seviye elektrodu, basınç sensörü, basınç anahtarı, akış anahtarı ve sıcaklık sensörü gibi saha elemanlarıyla çalışacak şekilde tasarlanmıştır. Motoru bu sinyallere göre otomatik başlatır ve durdurur.",

    /* ---------------- Manyetik Filtreler ---------------- */
    "sss.f1.q": "Manyetik filtre nedir, neden gereklidir?",
    "sss.f1.a":
      "Isıtma-soğutma sistemlerinde zamanla oluşan demir oksit (manyetit) parçacıkları pompaları aşındırır, eşanjörleri tıkar ve verimi düşürür. Manyetik filtre, güçlü mıknatıslarıyla bu parçacıkları su devresinden yakalayarak sistemi korur; arıza riskini ve bakım maliyetini azaltır.",
    "sss.f2.q": "IRONTRAP® manyetik filtrenin avantajı nedir?",
    "sss.f2.a":
      "IRONTRAP®, geleneksel filtreleme yöntemlerine göre %65 daha iyi partikül yakalama performansı gösterir. Tüm ısıtma-soğutma sistemleriyle uyumludur ve koruyucu-temizleyici sıvılarla birlikte kullanıldığında sisteme tam koruma sağlar.",
    "sss.f3.q": "IRONTRAP® ile IRONINOX® arasındaki fark nedir?",
    "sss.f3.a":
      "İki ürün de aynı manyetik ayrıştırma prensibiyle çalışır. IRONINOX®, paslanmaz çelik gövdesiyle özellikle endüstriyel tesisler ve büyük kapasiteli sistemler için tasarlanmıştır; IRONTRAP® ise konut ve ticari uygulamalar dahil geniş bir yelpazeyi kapsar.",
    "sss.f4.q": "Manyetik filtre hangi sistemlere takılabilir?",
    "sss.f4.a":
      "Tüm ısıtma ve soğutma sistemleriyle uyumludur: kazan devreleri, ısı pompası sistemleri, fan-coil ve chiller hatları, bölgesel ısıtma alt istasyonları ve daire içi ısı istasyonu devreleri. Genellikle kazana veya korunmak istenen ekipmana dönüş hattına monte edilir.",
    "sss.f5.q": "Manyetik filtrenin bakımı nasıl yapılır?",
    "sss.f5.a":
      "Bakım basittir: filtre vanaları kapatılır, mıknatıs çubuğu çıkarılır ve biriken çamur tahliye edilerek temizlenir. Isıtma sezonunda ilk kurulumdan birkaç hafta sonra, ardından yılda en az bir kez kontrol edilmesini öneririz.",
    "sss.f6.q": "Koruyucu ve temizleyici sıvılar ne işe yarar?",
    "sss.f6.a":
      "Temizleyici sıvılar mevcut sistemdeki çamur ve birikintileri çözerek suyla birlikte atılmasını sağlar; koruyucu sıvılar ise korozyon ve kireç oluşumunu engelleyen kimyasal film oluşturur. Manyetik filtre ile birlikte kullanıldığında sistem ömrü belirgin şekilde uzar.",

    /* ---------------- Enerji Yönetimi & Cloud ---------------- */
    "sss.e1.q": "Taytech Cloud nedir?",
    "sss.e1.a":
      "Taytech Cloud, tüm mekanik tesisat sistemlerinizi uzaktan izlemenizi ve yönetmenizi sağlayan IoT tabanlı bir platformdur. Panolar ve kontrolörler 3G/Wi-Fi modülleriyle platforma bağlanır; anlık veriler, alarmlar ve raporlar tek ekrandan takip edilir.",
    "sss.e2.q": "Enerji Yönetim Platformu (BLES) nedir?",
    "sss.e2.a":
      "BLES, bina genelindeki ısıtma, basınçlandırma ve ölçüm sistemlerini tek çatı altında toplayan enerji yönetim platformumuzdur. Sayaç verilerinin toplanması, tüketim raporlama ve sistem optimizasyonu bu platform üzerinden yürütülür.",
    "sss.e3.q": "M-Bus Converter ne işe yarar?",
    "sss.e3.a":
      "M-Bus Converter, binadaki kalorimetre ve su sayaçlarının M-Bus protokolüyle haberleşen verilerini toplayıp merkezi sisteme aktaran dönüştürücüdür. Daire bazlı tüketim verilerinin otomatik ve hatasız okunmasını sağlar.",
    "sss.e4.q": "Ön ödemeli kalorimetre sistemi nasıl çalışır?",
    "sss.e4.a":
      "Ön ödemeli sistemde daire sakini, enerji tüketimini önceden satın aldığı bakiye üzerinden kullanır. Bakiye bittiğinde sistem enerji beslemesini otomatik sınırlar. Site yönetimleri için tahsilat problemini ortadan kaldıran adil bir paylaşım modelidir.",
    "sss.e5.q": "Verilerime kimler erişebilir, sistem güvenli mi?",
    "sss.e5.a":
      "Cloud platformunda her kullanıcı yalnızca kendi yetki seviyesindeki verilere erişir; site yöneticisi, servis firması ve daire sakini farklı ekranlar görür. Veri iletimi şifreli bağlantı üzerinden yapılır.",

    /* ---------------- Kurulum & Devreye Alma ---------------- */
    "sss.k1.q": "Kurulumu Taytech mi yapıyor?",
    "sss.k1.a":
      "Montaj genellikle projenin mekanik yüklenicisi tarafından yapılır; Taytech ekibi devreye alma, parametre ayarları ve saha eğitimi aşamalarında yerinde destek verir. Talep edilirse anahtar teslim kurulum için çözüm ortaklarımızla birlikte hizmet sunarız.",
    "sss.k2.q": "Isı istasyonu montajı için nelere dikkat edilmeli?",
    "sss.k2.a":
      "İstasyonun servis erişimine uygun bir konuma montajı, gidiş-dönüş hatlarının doğru bağlanması, hat yıkamasının (flushing) yapılması ve devreye almadan önce sistemin havasının alınması kritik noktalardır. Her ürünle birlikte detaylı montaj kılavuzu verilir; kılavuzlara Doküman Merkezi'nden de ulaşabilirsiniz.",
    "sss.k3.q": "Mevcut sistemime Taytech ürünlerini entegre edebilir miyim?",
    "sss.k3.a":
      "Evet. Ürünlerimiz mevcut mekanik tesisat altyapılarına uyum sağlayacak şekilde tasarlanmıştır. Retrofit projelerinde mühendislik ekibimiz mevcut sistemi inceleyip uygun ürün konfigürasyonunu belirler.",
    "sss.k4.q": "Uzaktan izleme sistemi kurulumu ne kadar sürer?",
    "sss.k4.a":
      "Tekil bir pano bağlantısı aynı gün içinde tamamlanabilir; bina genelinde sayaç okuma ve BLES entegrasyonu içeren projelerde süre kapsamla birlikte değişir. Projenize özel zaman planı için ekibimizle iletişime geçebilirsiniz.",
    "sss.k5.q": "Devreye alma sonrası eğitim veriyor musunuz?",
    "sss.k5.a":
      "Evet. Devreye alma sırasında bina teknik personeline sistem kullanımı, parametre ayarları ve temel bakım konularında uygulamalı eğitim veriyoruz. İhtiyaç halinde ek eğitim oturumları da planlanabilir.",

    /* ---------------- Teknik Destek & Garanti ---------------- */
    "sss.d1.q": "Satış sonrası teknik destek sunuyor musunuz?",
    "sss.d1.a":
      "Evet. Taytech olarak satış öncesi danışmanlıktan kurulum sonrası teknik desteğe kadar tüm süreçlerde yanınızdayız. Destek talepleri telefon, e-posta ve iletişim formu üzerinden alınır.",
    "sss.d2.q": "Taytech ürünleri için garanti süresi ne kadardır?",
    "sss.d2.a":
      "Ürünlerimiz standart olarak 2 yıl garanti kapsamındadır. Garanti süresi boyunca üretim kaynaklı tüm arızalar ücretsiz olarak giderilir.",
    "sss.d3.q": "Yedek parça temini nasıl sağlanıyor?",
    "sss.d3.a":
      "Tüm ürünlerimizin yedek parçaları Gebze'deki üretim tesisimizde stoklanır ve hızlıca tedarik edilir. Ürünleriniz üretimden kalksa dahi makul bir süre boyunca parça desteği sağlamayı taahhüt ediyoruz.",
    "sss.d4.q": "Ürünlerinizin teknik dokümanlarına nasıl ulaşabilirim?",
    "sss.d4.a":
      "Tüm teknik veri sayfaları, akış şemaları, kabin çizimleri, kullanım kılavuzları ve CAD dosyaları web sitemizin Doküman Merkezi bölümünde ve her ürünün kendi sayfasındaki Dokümanlar başlığı altında yer alır.",
    "sss.d5.q": "Arıza durumunda ne yapmalıyım?",
    "sss.d5.a":
      "Öncelikle ürün kılavuzundaki arıza tablosunu kontrol edin; ekranlı ürünlerde hata kodu size sorunun kaynağını gösterir. Çözülemezse ürünün seri numarası ve hata koduyla birlikte teknik destek hattımıza ulaşın; gerekirse yerinde servis planlanır.",

    /* ---------------- Satış & Sipariş ---------------- */
    "sss.s1.q": "Projem için hangi ürünlerin uygun olduğunu nasıl belirleyebilirim?",
    "sss.s1.a":
      "Mühendislik ekibimiz, projenizin özelliklerine göre en uygun ürün ve sistem konfigürasyonunu belirlemek için ücretsiz teknik danışmanlık hizmeti sunmaktadır. Proje bilgilerinizi iletişim formundan bize iletebilirsiniz.",
    "sss.s2.q": "Fiyat teklifi nasıl alabilirim?",
    "sss.s2.a":
      "Web sitemizdeki iletişim formu, telefon veya e-posta üzerinden ürün/proje bilgilerinizi iletmeniz yeterlidir. Ekibimiz ihtiyacınızı netleştirdikten sonra kısa sürede detaylı teklif hazırlar.",
    "sss.s3.q": "Proje bazlı özel üretim yapıyor musunuz?",
    "sss.s3.a":
      "Evet. Standart serilerimizin yanında; özel kapasite, özel kabin ölçüsü, farklı haberleşme protokolü veya projeye özel kontrol senaryosu gerektiren durumlarda Ar-Ge merkezimizde projeye özel tasarım ve üretim yapıyoruz.",
    "sss.s4.q": "Teslimat süreleri ne kadar?",
    "sss.s4.a":
      "Standart ürünlerde stok durumuna göre teslimat genellikle kısa sürede yapılır; proje bazlı özel üretimlerde süre kapsamla birlikte netleşir. Sipariş öncesinde ekibimiz size güncel termin bilgisini iletir.",
  },
  EN: {
    "sss.bilgiMerkezi": "Knowledge Base",
    "sss.title": "Frequently Asked Questions",
    "sss.desc":
      "Answers to the most commonly asked questions about Taytech products, solutions, and services.",
    "sss.kategoriler": "Categories",
    "sss.tumu": "All",
    "sss.sorunuz": "Have a question?",
    "sss.sorunuzDesc": "Contact us if you can't find the answer you're looking for.",
    "sss.iletisim": "Get in Touch →",

    /* ---------------- Category names ---------------- */
    "sss.cat.genel": "General",
    "sss.cat.isi": "Heat Interface Units",
    "sss.cat.pano": "Motor Control Panels",
    "sss.cat.filtre": "Magnetic Filters",
    "sss.cat.enerji": "Energy Management & Cloud",
    "sss.cat.kurulum": "Installation & Commissioning",
    "sss.cat.destek": "Technical Support & Warranty",
    "sss.cat.satis": "Sales & Ordering",

    /* ---------------- General ---------------- */
    "sss.g1.q": "What does Taytech do?",
    "sss.g1.a":
      "Taytech Energy Technologies is a technology company providing end-to-end engineering solutions in heating-cooling control systems, smart motor control panels, heat interface units, electronic controllers, IRONTRAP® magnetic filters, and the Taytech Cloud remote monitoring platform.",
    "sss.g2.q": "Where are Taytech's production facilities?",
    "sss.g2.a":
      "All our production activities are carried out at our modern facilities in Gebze Plastikçiler Organised Industrial Zone, with a total area of 5,600 m². Our facility consists of a 4,750 m² production floor and an 860 m² R&D centre.",
    "sss.g3.q": "What certifications does Taytech hold?",
    "sss.g3.a":
      "Taytech holds ISO 9001:2015 Quality Management, ISO 14001:2015 Environmental Management, and ISO 45001:2018 Occupational Health and Safety certifications. All production processes are carried out in accordance with these standards.",
    "sss.g4.q": "Where is Taytech headquartered?",
    "sss.g4.a":
      "Our headquarters and factory are located in Gebze, Kocaeli, Türkiye: İnönü Mahallesi, Gebze Plastikçiler OSB, Atatürk Bulvarı No:7/2. We also operate through Taytech Technologies Ltd. in London, United Kingdom.",
    "sss.g5.q": "Does Taytech sell internationally?",
    "sss.g5.a":
      "Yes. Through our London-based office, Taytech Technologies Ltd., we supply products and engineering services to international markets, primarily the United Kingdom. Contact our team for export projects.",

    /* ---------------- Heat Interface Units ---------------- */
    "sss.h1.q": "What is a heat interface unit (HIU)?",
    "sss.h1.a":
      "A heat interface unit is a compact unit that distributes thermal energy from a central heating source (a district heating network or a building boiler room) to each individual apartment. It gives every dwelling its own heating and hot water control, combining per-apartment metering, comfort and energy savings.",
    "sss.h2.q": "What is the difference between Direct and Indirect heat interface units?",
    "sss.h2.a":
      "In Direct units, the central system water circulates directly through the apartment's heating circuit — there is no heat exchanger on the heating side. In Indirect units, the apartment circuit is fully separated hydraulically from the central system by a plate heat exchanger. Indirect systems are preferred in tall buildings to separate pressure zones and to protect the apartment installation from contamination in the central system.",
    "sss.h3.q": "What do the abbreviations DHW, RH, UFH and SH mean?",
    "sss.h3.a":
      "They indicate the unit's duty type: DHW (Domestic Hot Water) means hot water production, RH (Radiator Heating) means radiator-based heating, UFH (Underfloor Heating) means underfloor heating, and SH (Space Heating) means general space heating. For example, an \"Indirect SmartHexa DHW-SH\" is an indirect unit that provides both hot water and space heating.",
    "sss.h4.q": "What is the difference between the SmartHexa, HydroHexa and ThermoHexa series?",
    "sss.h4.a":
      "SmartHexa is the most advanced series, equipped with an electronic control system that monitors temperature, pressure and flow at multiple points, plus proportional motorised valves. HydroHexa is an economical and reliable series operating on a proportional (hydraulic) control principle that requires no electricity. ThermoHexa is a simple, low-maintenance solution using thermostatic control elements. The choice depends on your project budget and required control precision.",
    "sss.h5.q": "Which building types are heat interface units suitable for?",
    "sss.h5.a":
      "They can be used in any building with a central heating system: residential complexes, apartment towers, student accommodation, hotels, hospitals and mixed-use projects. They also serve as the apartment connection point in city projects connected to district heating networks.",
    "sss.h6.q": "What materials are used in your heat interface units?",
    "sss.h6.a":
      "Stainless steel is used for the heat exchangers and pipework. This means a long service life and hygienic preparation of domestic hot water. Valves and control components are selected from industrial-grade parts.",
    "sss.h7.q": "How does a heat interface unit prepare domestic hot water?",
    "sss.h7.a":
      "When a tap is opened, the unit instantly heats cold water through a plate heat exchanger using energy from the central system — no storage is involved. Instantaneous production minimises legionella risk and provides hygienic hot water without waiting. In DHW-priority models, hot water demand takes precedence over heating.",
    "sss.h8.q": "What is outdoor (weather) compensation and can it be added?",
    "sss.h8.a":
      "Outdoor compensation automatically adjusts the heating flow temperature according to the outside temperature. It can be optionally integrated into electronically controlled units such as SmartHexa and significantly improves the building's overall energy efficiency.",
    "sss.h9.q": "Can consumption be metered on heat interface units?",
    "sss.h9.a":
      "Yes. A heat meter can be integrated into each unit to measure the actual energy consumption of every apartment. Meter data is collected centrally via M-Bus infrastructure, and with our prepaid heat meter solution, consumption can also be managed on a prepaid balance basis.",
    "sss.h10.q": "What products do you offer for district heating projects?",
    "sss.h10.a":
      "Our district heating stations transfer energy from the city network to buildings or apartments. Together with the Meter Tech W1 metering unit, first-fix installation kit, heating calorimeter and prepaid heat meter, a complete end-to-end district heating infrastructure can be built.",

    /* ---------------- Motor Control Panels ---------------- */
    "sss.p1.q": "What is a motor control panel and what does it do?",
    "sss.p1.a":
      "A motor control panel is an electrical/electronic control unit that automatically starts, stops, protects and monitors pump and motor systems. It ensures the safe and efficient operation of motors in applications such as clean water boosting, wastewater discharge, filling-draining and fire pump duty.",
    "sss.p2.q": "Which motor starting methods do you offer?",
    "sss.p2.a":
      "We offer four main methods: Direct Start (direct-on-line), Star-Delta starting, Soft Starter, and variable speed drive with frequency inverters (FxA / FxS series). The right method is determined at the design stage based on motor power, inrush current limits and energy efficiency targets.",
    "sss.p3.q": "What are the advantages of frequency inverter (FxA / FxS) panels?",
    "sss.p3.a":
      "Frequency inverter panels vary motor speed according to demand, maintaining constant pressure and significantly reducing energy consumption. They can drive systems of up to 4 three-phase motors, and offer easy setup via LCD display, factory-fitted motor protection circuit breakers, and remote monitoring and control via 3G/Wi-Fi module.",
    "sss.p4.q": "What are the Smart Series panels?",
    "sss.p4.a":
      "The Smart Series consists of compact microprocessor control panels: Smart Booster (pressurisation), Smart Box (filling/draining), Smart Bore Hole, Smart Wastewater, Smart Grinder and Smart Exclusive. All feature parameter setting via LCD display, event/message logging and optional 3G/Wi-Fi remote management.",
    "sss.p5.q": "How many pumps can your panels control?",
    "sss.p5.a":
      "It varies by series: the Smart Series controls up to 2 pumps, while the Direct Start and frequency inverter FxA/FxS series can simultaneously control up to 4 pumps with single or three-phase motors. For larger configurations, we manufacture custom panels on a project basis.",
    "sss.p6.q": "Which standards do your fire pump control panels comply with?",
    "sss.p6.a":
      "We manufacture two separate ranges: electric and diesel motor control panels complying with NFPA 20 / UL & FM requirements, and electric and diesel series complying with the EN 12845 standard. This allows us to serve fire protection systems designed to both American and European norms.",
    "sss.p7.q": "Is remote monitoring of the panels possible?",
    "sss.p7.a":
      "Yes. Panels equipped with a 3G/Wi-Fi module connect to the Taytech Cloud platform; you can operate the system remotely, view live data, change parameters and receive instant fault notifications.",
    "sss.p8.q": "Can field devices like float switches and pressure sensors be connected?",
    "sss.p8.a":
      "Yes. Our panels are designed to work with field devices such as float switches, level electrodes, pressure sensors, pressure switches, flow switches and temperature sensors. The motor is started and stopped automatically based on these signals.",

    /* ---------------- Magnetic Filters ---------------- */
    "sss.f1.q": "What is a magnetic filter and why is it needed?",
    "sss.f1.a":
      "Iron oxide (magnetite) particles that form over time in heating-cooling systems wear out pumps, clog heat exchangers and reduce efficiency. A magnetic filter captures these particles from the water circuit with powerful magnets, protecting the system and reducing breakdown risk and maintenance costs.",
    "sss.f2.q": "What is the advantage of the IRONTRAP® magnetic filter?",
    "sss.f2.a":
      "IRONTRAP® delivers 65% better particle capture performance than conventional filtering methods. It is compatible with all heating-cooling systems and, when used together with protective and cleaning fluids, provides complete system protection.",
    "sss.f3.q": "What is the difference between IRONTRAP® and IRONINOX®?",
    "sss.f3.a":
      "Both products work on the same magnetic separation principle. IRONINOX®, with its stainless steel body, is designed especially for industrial facilities and high-capacity systems, while IRONTRAP® covers a wide range including residential and commercial applications.",
    "sss.f4.q": "Which systems can a magnetic filter be fitted to?",
    "sss.f4.a":
      "It is compatible with all heating and cooling systems: boiler circuits, heat pump systems, fan-coil and chiller lines, district heating substations and in-apartment HIU circuits. It is typically installed on the return line to the boiler or the equipment being protected.",
    "sss.f5.q": "How is a magnetic filter maintained?",
    "sss.f5.a":
      "Maintenance is simple: close the filter valves, remove the magnet rod, and drain and clean the accumulated sludge. We recommend checking it a few weeks after first installation during the heating season, then at least once a year.",
    "sss.f6.q": "What do protective and cleaning fluids do?",
    "sss.f6.a":
      "Cleaning fluids dissolve existing sludge and deposits so they can be flushed out of the system; protective fluids form a chemical film that prevents corrosion and limescale. Used together with a magnetic filter, they significantly extend system life.",

    /* ---------------- Energy Management & Cloud ---------------- */
    "sss.e1.q": "What is Taytech Cloud?",
    "sss.e1.a":
      "Taytech Cloud is an IoT-based platform that allows you to remotely monitor and manage all your mechanical installation systems. Panels and controllers connect to the platform via 3G/Wi-Fi modules; live data, alarms and reports are tracked from a single screen.",
    "sss.e2.q": "What is the Energy Management Platform (BLES)?",
    "sss.e2.a":
      "BLES is our energy management platform that brings the building's heating, pressurisation and metering systems together under one roof. Meter data collection, consumption reporting and system optimisation are all handled through this platform.",
    "sss.e3.q": "What does the M-Bus Converter do?",
    "sss.e3.a":
      "The M-Bus Converter collects data from heat meters and water meters communicating via the M-Bus protocol and transfers it to the central system. It enables automatic, error-free reading of per-apartment consumption data.",
    "sss.e4.q": "How does the prepaid heat meter system work?",
    "sss.e4.a":
      "In a prepaid system, residents use energy from a balance they purchase in advance. When the balance runs out, the system automatically limits the energy supply. It is a fair sharing model that eliminates collection problems for building management.",
    "sss.e5.q": "Who can access my data — is the system secure?",
    "sss.e5.a":
      "On the Cloud platform, each user only accesses data at their own authorisation level; the building manager, service company and residents see different screens. Data transmission is carried out over encrypted connections.",

    /* ---------------- Installation & Commissioning ---------------- */
    "sss.k1.q": "Does Taytech carry out the installation?",
    "sss.k1.a":
      "Installation is usually carried out by the project's mechanical contractor; the Taytech team provides on-site support during commissioning, parameter setting and field training. On request, we offer turnkey installation together with our solution partners.",
    "sss.k2.q": "What should be considered when installing a heat interface unit?",
    "sss.k2.a":
      "Critical points include mounting the unit in a position with proper service access, connecting the flow and return lines correctly, flushing the pipework, and venting the system before commissioning. A detailed installation manual is supplied with every product and is also available in the Document Centre.",
    "sss.k3.q": "Can I integrate Taytech products into my existing system?",
    "sss.k3.a":
      "Yes. Our products are designed to be compatible with existing mechanical installation infrastructures. In retrofit projects, our engineering team inspects the existing system and determines the appropriate product configuration.",
    "sss.k4.q": "How long does remote monitoring system installation take?",
    "sss.k4.a":
      "A single panel connection can be completed within the same day; for projects involving building-wide meter reading and BLES integration, the timescale depends on the scope. Contact our team for a schedule tailored to your project.",
    "sss.k5.q": "Do you provide training after commissioning?",
    "sss.k5.a":
      "Yes. During commissioning we provide hands-on training to the building's technical staff on system operation, parameter settings and basic maintenance. Additional training sessions can be arranged if needed.",

    /* ---------------- Technical Support & Warranty ---------------- */
    "sss.d1.q": "Do you offer after-sales technical support?",
    "sss.d1.a":
      "Yes. At Taytech, we are by your side in all processes from pre-sales consultancy to post-installation technical support. Support requests are received by phone, e-mail and the contact form.",
    "sss.d2.q": "What is the warranty period for Taytech products?",
    "sss.d2.a":
      "Our products come with a standard 2-year warranty. All manufacturing-related defects are repaired free of charge during the warranty period.",
    "sss.d3.q": "How is spare part supply handled?",
    "sss.d3.a":
      "Spare parts for all our products are stocked at our production facility in Gebze and supplied quickly. We are committed to providing parts support for a reasonable period even after a product is discontinued.",
    "sss.d4.q": "How can I access your product technical documents?",
    "sss.d4.a":
      "All technical data sheets, flow diagrams, cabinet drawings, user manuals and CAD files are available in the Document Centre section of our website and under the Documents heading on each product's own page.",
    "sss.d5.q": "What should I do in case of a fault?",
    "sss.d5.a":
      "First check the fault table in the product manual; on products with a display, the error code indicates the source of the problem. If it cannot be resolved, contact our technical support line with the product's serial number and error code; on-site service will be arranged if necessary.",

    /* ---------------- Sales & Ordering ---------------- */
    "sss.s1.q": "How can I determine which products are suitable for my project?",
    "sss.s1.a":
      "Our engineering team offers a free technical consultancy service to determine the most suitable product and system configuration for your project. You can send us your project details via the contact form.",
    "sss.s2.q": "How can I get a quotation?",
    "sss.s2.a":
      "Simply send us your product/project details via the contact form on our website, by phone or by e-mail. After clarifying your requirements, our team will prepare a detailed quotation within a short time.",
    "sss.s3.q": "Do you manufacture custom products on a project basis?",
    "sss.s3.a":
      "Yes. Alongside our standard ranges, our R&D centre designs and manufactures project-specific solutions for cases requiring special capacities, custom cabinet dimensions, different communication protocols or bespoke control scenarios.",
    "sss.s4.q": "What are your delivery times?",
    "sss.s4.a":
      "Standard products are usually delivered within a short time depending on stock; for project-based custom production, the timescale is confirmed with the scope. Our team will provide you with up-to-date lead time information before ordering.",
  },
};
