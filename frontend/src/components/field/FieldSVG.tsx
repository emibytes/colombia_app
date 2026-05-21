export default function FieldSVG() {
  return (
    <svg
      viewBox="0 0 340 500"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Field border */}
      <rect x="10" y="10" width="320" height="480" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" rx="4"/>
      {/* Center line */}
      <line x1="10" y1="250" x2="330" y2="250" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      {/* Center circle */}
      <circle cx="170" cy="250" r="46" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <circle cx="170" cy="250" r="3"  fill="rgba(255,255,255,0.35)"/>

      {/* Top penalty area */}
      <rect x="70" y="10" width="200" height="80" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      {/* Top goal area */}
      <rect x="115" y="10" width="110" height="36" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      {/* Top penalty spot */}
      <circle cx="170" cy="68" r="2.5" fill="rgba(255,255,255,0.35)"/>
      {/* Top penalty arc */}
      <path d="M 130 90 A 46 46 0 0 0 210 90" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>

      {/* Bottom penalty area */}
      <rect x="70" y="410" width="200" height="80" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      {/* Bottom goal area */}
      <rect x="115" y="454" width="110" height="36" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      {/* Bottom penalty spot */}
      <circle cx="170" cy="432" r="2.5" fill="rgba(255,255,255,0.35)"/>
      {/* Bottom penalty arc */}
      <path d="M 130 410 A 46 46 0 0 1 210 410" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>

      {/* Corner arcs */}
      <path d="M 10 26 A 16 16 0 0 1 26 10"  fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <path d="M 314 10 A 16 16 0 0 1 330 26" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <path d="M 10 474 A 16 16 0 0 0 26 490" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
      <path d="M 330 474 A 16 16 0 0 1 314 490" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
    </svg>
  );
}
