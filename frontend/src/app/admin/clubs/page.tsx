"use client";
import { useEffect, useState } from "react";
import { adminApi, AdminClub } from "@/lib/adminApi";

export default function AdminClubsPage() {
  const [clubs, setClubs]     = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminClub | null>(null);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    adminApi.getClubs().then(setClubs).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar club?")) return;
    await adminApi.deleteClub(id);
    setClubs((c) => c.filter((x) => x.id !== id));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateClub(editing.id, {
        name:        editing.name,
        short_name:  editing.short_name,
        city:        editing.city,
        league_name: editing.league_name,
      });
      setClubs((c) => c.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando clubes…</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62]">Clubes</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-[#001e62] text-white">
            <tr>
              {["Nombre", "Abrev.", "País", "Ciudad", "Liga", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clubs.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-gray-600">{c.short_name ?? "—"}</td>
                <td className="px-4 py-2">{c.country ?? "—"}</td>
                <td className="px-4 py-2">{c.city ?? "—"}</td>
                <td className="px-4 py-2">{c.league_name ?? "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => setEditing(c)}
                    className="text-[#001e62] hover:underline text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">
              Editar club
            </h2>
            {[
              { label: "Nombre",      key: "name"        },
              { label: "Abreviatura", key: "short_name"  },
              { label: "Ciudad",      key: "city"        },
              { label: "Liga",        key: "league_name" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  type="text"
                  value={(editing[key as keyof AdminClub] as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value || null })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="text-sm text-gray-500 hover:underline">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#ffd100] text-[#001e62] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
