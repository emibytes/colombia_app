"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/lib/api";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/Logo";

const STEPS = [
  { href: "/",          label: "Inicio"    },
  { href: "/seleccion", label: "Mis 23"    },
  { href: "/once",      label: "11 Ideal"  },
  { href: "/resultado", label: "Resultado" },
];

export default function Navbar() {
  const pathname        = usePathname();
  const router          = useRouter();
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    clear();
    router.push("/");
  }

  return (
    <>
    {/* Gradient mask — enmascara el contenido que scrollea bajo el navbar */}
    <div
      className="fixed top-0 left-0 right-0 z-[45] pointer-events-none h-[4.5rem]"
      style={{ background: "linear-gradient(to bottom, var(--dark) 0%, var(--dark) 55%, transparent 100%)" }}
    />
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
      <div className="bg-[rgba(5,8,15,0.8)] backdrop-blur-2xl border border-[var(--border)] rounded-full px-3 py-2 flex items-center justify-between gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

        {/* Logo */}
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity duration-300 pl-1 shrink-0"
          aria-label="Mi Selección Colombia — Inicio"
        >
          <Logo size={30} withWordmark />
        </Link>

        {/* Steps — desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          {STEPS.map((s) => {
            const active = pathname === s.href;
            return (
              <Link
                key={s.href}
                href={s.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300",
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
        <div className="sm:hidden flex gap-1.5">
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

        {/* Auth — desktop */}
        <div className="hidden sm:flex items-center gap-1 pr-1 shrink-0">
          {user ? (
            <>
              <span className="text-[11px] text-[var(--muted)] max-w-[7rem] truncate">
                {user.name.split(" ")[0]}
              </span>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-2 py-1 rounded-full text-[11px] font-bold text-[var(--yellow)] hover:bg-[rgba(252,209,22,0.08)] transition-all"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-2 py-1 rounded-full text-[11px] text-[var(--muted)] hover:text-white hover:bg-white/5 transition-all"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-[var(--border)] text-[var(--muted)] hover:text-white hover:border-[var(--border2)] transition-all"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
    </>
  );
}
