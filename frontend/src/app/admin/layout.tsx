"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/lib/api";
import {
  SquaresFour,
  UsersThree,
  Buildings,
  Flag,
  Globe,
  SignOut,
  ArrowLeft,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",                label: "Dashboard",       Icon: SquaresFour },
  { href: "/admin/players",        label: "Jugadores",       Icon: UsersThree  },
  { href: "/admin/clubs",          label: "Clubes",          Icon: Buildings   },
  { href: "/admin/federations",    label: "Federaciones",    Icon: Flag        },
  { href: "/admin/confederations", label: "Confederaciones", Icon: Globe       },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    clear();
    router.push("/login");
  }

  return (
    <div className="min-h-dvh bg-[#05080F] flex">
      {/* ── Sidebar — desktop ─────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-[#0C1018] border-r border-[rgba(252,209,22,0.07)] sticky top-0 h-dvh flex-none">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-[rgba(252,209,22,0.07)]">
          <span className="font-[family-name:var(--font-bebas)] text-xl tracking-[0.3em] text-[#FCD116]">
            COL2026
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B7280] mt-0.5">
            Panel Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[rgba(252,209,22,0.08)] text-[#FCD116] border border-[rgba(252,209,22,0.15)]"
                    : "text-[#6B7280] hover:text-[#F0EDE8] hover:bg-[rgba(255,255,255,0.04)]"
                )}
              >
                <Icon size={18} weight={active ? "fill" : "regular"} className="flex-none" />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FCD116]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Tricolor separator */}
        <div className="flex mx-5 mb-4 gap-0.5">
          <div className="h-px flex-[3] bg-[#FCD116]/40" />
          <div className="h-px flex-[2] bg-[#003087]/60" />
          <div className="h-px flex-[1.5] bg-[#CE1126]/50" />
        </div>

        {/* User + logout */}
        <div className="px-4 pb-5 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#6B7280] hover:text-[#F0EDE8] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-200"
          >
            <ArrowLeft size={14} />
            Volver a la app
          </Link>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)]">
            <div className="w-7 h-7 rounded-full bg-[rgba(252,209,22,0.15)] border border-[rgba(252,209,22,0.25)] flex items-center justify-center flex-none">
              <span className="text-[11px] font-bold text-[#FCD116]">
                {user?.name?.[0]?.toUpperCase() ?? "A"}
              </span>
            </div>
            <span className="text-xs text-[#F0EDE8]/80 truncate flex-1">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-[#6B7280] hover:text-[#CE1126] transition-colors duration-200 flex-none"
              title="Cerrar sesión"
            >
              <SignOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Content ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden bg-[#0C1018] border-b border-[rgba(252,209,22,0.07)] px-4 py-3 flex items-center justify-between">
          <span className="font-[family-name:var(--font-bebas)] text-lg tracking-[0.25em] text-[#FCD116]">
            COL2026 Admin
          </span>
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label }) => {
              const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                    active
                      ? "bg-[rgba(252,209,22,0.1)] text-[#FCD116]"
                      : "text-[#6B7280] hover:text-[#F0EDE8]"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="flex-1 p-5 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
