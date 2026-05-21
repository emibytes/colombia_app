import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62]">
        Panel de administración
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/players"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition text-center"
        >
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-[#001e62]">Jugadores</p>
          <p className="text-sm text-gray-500 mt-1">Gestionar prelista y plantilla</p>
        </Link>
        <Link
          href="/admin/clubs"
          className="bg-white rounded-xl shadow p-6 hover:shadow-md transition text-center"
        >
          <p className="font-[family-name:var(--font-bebas)] text-3xl text-[#001e62]">Clubes</p>
          <p className="text-sm text-gray-500 mt-1">Gestionar clubes y ligas</p>
        </Link>
      </div>
    </div>
  );
}
