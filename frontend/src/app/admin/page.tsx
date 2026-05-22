import Link from "next/link";
import { UsersThree, Buildings, Flag, Globe, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const SECTIONS = [
  {
    href:    "/admin/players",
    label:   "Jugadores",
    desc:    "Gestionar prelista, posiciones y camisetas",
    Icon:    UsersThree,
    accent:  "from-[rgba(0,48,135,0.15)] to-[rgba(13,148,136,0.08)]",
    border:  "border-[rgba(0,48,135,0.3)]",
    iconClr: "text-[#6B9FFF]",
  },
  {
    href:    "/admin/clubs",
    label:   "Clubes",
    desc:    "Gestionar clubes, ciudades y ligas",
    Icon:    Buildings,
    accent:  "from-[rgba(252,209,22,0.08)] to-[rgba(206,17,38,0.06)]",
    border:  "border-[rgba(252,209,22,0.15)]",
    iconClr: "text-[#FCD116]",
  },
  {
    href:    "/admin/federations",
    label:   "Federaciones",
    desc:    "Gestionar selecciones y datos FIFA",
    Icon:    Flag,
    accent:  "from-[rgba(13,148,136,0.12)] to-[rgba(0,48,135,0.06)]",
    border:  "border-[rgba(13,148,136,0.25)]",
    iconClr: "text-[#2DD4BF]",
  },
  {
    href:    "/admin/confederations",
    label:   "Confederaciones",
    desc:    "Gestionar CONMEBOL, UEFA y otras",
    Icon:    Globe,
    accent:  "from-[rgba(206,17,38,0.1)] to-[rgba(252,209,22,0.05)]",
    border:  "border-[rgba(206,17,38,0.25)]",
    iconClr: "text-[#FF6B6B]",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <span className="inline-flex items-center rounded-full bg-[rgba(252,209,22,0.08)] border border-[rgba(252,209,22,0.15)] px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-[#FCD116] mb-4">
          Panel Admin
        </span>
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl lg:text-5xl text-[#F0EDE8] tracking-wide">
          Panel de
          <span className="text-[#FCD116]"> administración</span>
        </h1>
        <p className="text-[#6B7280] text-sm mt-2">
          Colombia 2026 · Gestión de datos del torneo
        </p>
      </div>

      {/* Nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map(({ href, label, desc, Icon, accent, border, iconClr }) => (
          <Link key={href} href={href}>
            <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent} border ${border} p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,0,0,0.4)] cursor-pointer`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`${iconClr} transition-transform duration-300 group-hover:-translate-y-0.5`}>
                  <Icon size={28} weight="duotone" />
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-[#6B7280] transition-all duration-300 group-hover:text-[#FCD116] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
              <p className="font-[family-name:var(--font-bebas)] text-2xl text-[#F0EDE8] tracking-wide">
                {label}
              </p>
              <p className="text-[#6B7280] text-xs mt-1 leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
