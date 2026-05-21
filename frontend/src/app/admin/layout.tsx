"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { logout } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    clear();
    router.push("/login");
  }

  return (
    <div className="min-h-dvh flex flex-col bg-gray-50">
      <header className="bg-[#001e62] text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide">
            Admin Colombia 2026
          </span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="hover:text-[#ffd100] transition">Dashboard</Link>
            <Link href="/admin/players" className="hover:text-[#ffd100] transition">Jugadores</Link>
            <Link href="/admin/clubs" className="hover:text-[#ffd100] transition">Clubes</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="opacity-70">{user?.name}</span>
          <button onClick={handleLogout} className="hover:text-[#ffd100] transition">
            Salir
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
