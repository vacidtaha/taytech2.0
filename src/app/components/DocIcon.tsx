// Doküman tipi ikonları ve etiketleri — Doküman Merkezi ile ana sayfada ortak.

export const docTypeLabels: Record<string, { tr: string; en: string }> = {
  katalog: { tr: "Katalog", en: "Catalogue" },
  teknik: { tr: "Teknik Doküman", en: "Technical Document" },
  kilavuz: { tr: "Kullanım Kılavuzu", en: "User Manual" },
  sertifika: { tr: "Sertifika", en: "Certificate" },
  cad: { tr: "CAD Çizimi", en: "CAD Drawing" },
  genel: { tr: "Genel Katalog", en: "General Catalog" },
};

export function DocIcon({ type }: { type: string }) {
  if (type === "genel") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="4" width="24" height="36" rx="2" stroke="#dc2626" strokeWidth="2" />
        <rect x="12" y="8" width="24" height="36" rx="2" stroke="#dc2626" strokeWidth="2" fill="white" />
        <rect x="16" y="12" width="24" height="36" rx="2" stroke="#dc2626" strokeWidth="2" fill="white" />
        <line x1="22" y1="22" x2="34" y2="22" stroke="#dc2626" strokeWidth="1.5" />
        <line x1="22" y1="28" x2="32" y2="28" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="22" y1="34" x2="30" y2="34" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
      </svg>
    );
  }
  if (type === "cad") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" stroke="#dc2626" strokeWidth="2" />
        <path d="M14 4V0M26 4V0M14 40v4M26 40v4" stroke="#dc2626" strokeWidth="1.5" />
        <line x1="12" y1="14" x2="28" y2="14" stroke="#dc2626" strokeWidth="1.5" />
        <line x1="12" y1="20" x2="24" y2="20" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="12" y1="25" x2="26" y2="25" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="12" y1="30" x2="20" y2="30" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <rect x="32" y="16" width="12" height="16" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="38" cy="24" r="4" stroke="#dc2626" strokeWidth="1" />
        <line x1="38" y1="20" x2="38" y2="28" stroke="#dc2626" strokeWidth="0.5" />
        <line x1="34" y1="24" x2="42" y2="24" stroke="#dc2626" strokeWidth="0.5" />
      </svg>
    );
  }
  if (type === "kilavuz") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <path d="M24 8C20 6 14 5 6 6v30c8-1 14 0 18 2 4-2 10-3 18-2V6c-8-1-14 0-18 2z" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round" />
        <line x1="24" y1="8" x2="24" y2="38" stroke="#dc2626" strokeWidth="1.5" />
        <line x1="11" y1="14" x2="20" y2="14" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="11" y1="19" x2="19" y2="19" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="11" y1="24" x2="18" y2="24" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="28" y1="14" x2="37" y2="14" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="28" y1="19" x2="36" y2="19" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="28" y1="24" x2="35" y2="24" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
      </svg>
    );
  }
  if (type === "sertifika") {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="32" height="30" rx="2" stroke="#dc2626" strokeWidth="2" />
        <line x1="14" y1="14" x2="34" y2="14" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <line x1="14" y1="19" x2="30" y2="19" stroke="#dc2626" strokeWidth="1" opacity="0.5" />
        <circle cx="34" cy="34" r="7" stroke="#dc2626" strokeWidth="2" fill="white" />
        <path d="M31 40l-2 6 5-3 5 3-2-6" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round" fill="white" />
        <path d="M31 34l2 2 4-4" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path d="M4 12h16l4-4h20v32H4V12z" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round" />
      <line x1="4" y1="18" x2="44" y2="18" stroke="#dc2626" strokeWidth="1.5" />
      <rect x="16" y="24" width="16" height="2" fill="#dc2626" opacity="0.3" />
      <rect x="18" y="30" width="12" height="2" fill="#dc2626" opacity="0.3" />
    </svg>
  );
}
