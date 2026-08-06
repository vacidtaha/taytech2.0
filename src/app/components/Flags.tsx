/**
 * Adres bloklarında ülke sembolü olarak kullanılan bayraklar (inline SVG).
 * Emoji bayraklar her platformda görünmediği için SVG tercih edildi.
 */

export function FlagTR({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#fff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <path
        fill="#fff"
        d="M583.334 400l180.901 58.779-111.804-153.885v190.212l111.804-153.885z"
      />
    </svg>
  );
}

export function FlagGB({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <clipPath id="flag-gb-s">
        <path d="M0,0 v40 h60 v-40 z" />
      </clipPath>
      <clipPath id="flag-gb-t">
        <path d="M30,20 h30 v20 z v20 h-30 z h-30 v-20 z v-20 h30 z" />
      </clipPath>
      <g clipPath="url(#flag-gb-s)">
        <path d="M0,0 v40 h60 v-40 z" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
        <path
          d="M0,0 L60,40 M60,0 L0,40"
          clipPath="url(#flag-gb-t)"
          stroke="#C8102E"
          strokeWidth="5"
        />
        <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="13" />
        <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="8" />
      </g>
    </svg>
  );
}
