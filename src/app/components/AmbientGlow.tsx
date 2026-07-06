/**
 * Akışkan kırmızı ambient arka plan efekti.
 * Sayfanın tüm boyunca (inset-0) yayılan, yavaşça süzülen yumuşak kırmızı
 * blob'lar. `relative isolate overflow-hidden` bir kapsayıcının ilk çocuğu
 * olarak kullanılır; negatif z-index + izole katman sayesinde içeriğin altında
 * kalır ve okunabilirliği bozmaz. Blob konumları yüzdesel olduğundan sayfa
 * uzadıkça efekt de boydan boya devam eder.
 */
const BLOBS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function AmbientGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`ambient-glow pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {BLOBS.map((n) => (
        <span key={n} className={`ambient-blob ambient-blob-${n}`} />
      ))}
    </div>
  );
}
