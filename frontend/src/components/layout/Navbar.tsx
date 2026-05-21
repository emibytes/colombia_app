"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/",          label: "Inicio",      dot: 1 },
  { href: "/seleccion", label: "Mis 23",       dot: 2 },
  { href: "/once",      label: "11 Ideal",     dot: 3 },
  { href: "/resultado", label: "Resultado",    dot: 4 },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
      {/* Outer pill shell */}
      <div className="bg-[rgba(5,8,15,0.8)] backdrop-blur-2xl border border-[var(--border)] rounded-full px-3 py-2 flex items-center justify-between gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl tracking-widest text-[var(--yellow)] hover:opacity-80 transition-opacity duration-300 pl-1 flex items-center gap-1.5"
        >
          🇨🇴 <span className="text-white/80">COL</span>2026
        </Link>

        {/* Steps */}
        <nav className="hidden sm:flex items-center gap-1">
          {STEPS.map((s) => {
            const active = pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300",
                  "cubic-bezier(0.32,0.72,0,1)",
                  active
                    ? "bg-[rgba(252,209,22,0.12)] text-[var(--yellow)]"
                    : "text-[var(--muted)] hover:text-white hover:bg-white/5"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                    active ? "bg-[var(--yellow)]" : "bg-[var(--muted)]"
                  )}
                />
                {s.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile dots */}
        <div className="sm:hidden flex gap-1.5 pr-1">
          {STEPS.map((s) => (
            <Link key={s.href} href={s.href}>
              <span
                className={cn(
                  "block w-1.5 h-1.5 rounded-full transition-colors duration-300",
                  pathname === s.href ? "bg-[var(--yellow)]" : "bg-[var(--muted)]"
                )}
              />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
