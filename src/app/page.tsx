import HomeHero from "./components/HomeHero";
// Scroll video bölümü şimdilik devre dışı; tekrar açmak için importu ve
// aşağıdaki <HomeScrollVideo /> satırını geri al.
// import HomeScrollVideo from "./components/HomeScrollVideo";
import HomeShowcase from "./components/HomeShowcase";
import HomeDocuments from "./components/HomeDocuments";
import HomeStandards from "./components/HomeStandards";
import HomeSolutions from "./components/HomeSolutions";
import HomeFaq from "./components/HomeFaq";
import { getCategoryProductsDeep, getAllDocuments } from "@/lib/catalog";

export default async function Home() {
  const [heatStationProducts, smartSeriesProducts, motorControlProducts, allDocs] =
    await Promise.all([
      getCategoryProductsDeep("isi-istasyonlari"),
      getCategoryProductsDeep("smart-serisi"),
      getCategoryProductsDeep("kontrol-panelleri", {
        excludeSlugs: ["smart-serisi"],
      }),
      getAllDocuments(),
    ]);

  // Doküman Merkezi'nden rastgele 8 doküman (sayfa yeniden üretildiğinde değişir)
  const randomDocs = [...allDocs].sort(() => Math.random() - 0.5).slice(0, 8);
  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      <h1 className="sr-only">
        Taytech - Motor Kontrol Panoları &amp; Isı İstasyonları
      </h1>
      <div className="overflow-x-hidden">
        <HomeHero />
      </div>
      {/* <HomeScrollVideo /> */}
      <HomeShowcase
        videoSrc="/isiistasyonu.mp4"
        videoSide="right"
        titleKey="home.isiistasyonu.title"
        descKey="home.isiistasyonu.desc"
        btnKey="home.isiistasyonu.btn"
        href="/urunler/isi-istasyonlari"
        products={heatStationProducts}
      />
      <HomeDocuments docs={randomDocs} />
      <HomeShowcase
        videoSrc="/smartserisi.mp4"
        videoSide="right"
        titleKey="home.smartserisi.title"
        descKey="home.smartserisi.desc"
        btnKey="home.smartserisi.btn"
        href="/urunler/smart-serisi"
        products={smartSeriesProducts}
      />
      <HomeStandards />
      <HomeShowcase
        videoSrc="/motorkontrol.mp4"
        videoSide="left"
        titleKey="home.motorkontrol.title"
        descKey="home.motorkontrol.desc"
        btnKey="home.motorkontrol.btn"
        href="/urunler/kontrol-panelleri"
        products={motorControlProducts}
      />
      <HomeFaq />
      <HomeSolutions />
    </main>
  );
}
