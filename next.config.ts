import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content Security Policy — nonce kullanmadan (statik render korunur).
// Dev'de React 'unsafe-eval' ve HMR için ws: gerektirir.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://api.emailjs.com${isDev ? " ws: http://localhost:*" : ""}`,
  `frame-src https://www.google.com`,
  `media-src 'self'`,
  `worker-src 'self' blob:`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isDev ? [] : [`upgrade-insecure-requests`]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  // better-sqlite3 native bir modül; sunucu tarafında bundle'a girmemeli.
  serverExternalPackages: ["better-sqlite3"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Statik medya bir yıl önbelleğe alınır; tarayıcı tekrar indirmez.
      // DİKKAT: Bu dosyalardan birinin içeriği değişirse dosya ADI da
      // değiştirilmeli (örn. video-v2.mp4), yoksa ziyaretçiler eskisini görür.
      {
        source: "/:file*.(mp4|webm|webp|jpg|jpeg|png|avif|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
