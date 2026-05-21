"use client";
import { useEffect, useState } from "react";
import { adminApi, AdminPlayer } from "@/lib/adminApi";

export default function AdminPlayersPage() {
  const [players, setPlayers]   = useState<AdminPlayer[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<AdminPlayer | null>(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    adminApi.getPlayers().then(setPlayers).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar jugador?")) return;
    await adminApi.deletePlayer(id);
    setPlayers((p) => p.filter((x) => x.id !== id));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updatePlayer(editing.id, {
        jersey_number:       editing.jersey_number,
        active:              editing.active,
        in_wc_prelista_2026: editing.in_wc_prelista_2026,
      });
      setPlayers((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando jugadores…</p>;

  return (
    <div className="space-y-4">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62]">Jugadores</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-[#001e62] text-white">
            <tr>
              {["#", "Nombre", "Posición", "Camiseta", "Prelista", "Activo", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.id} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                <td className="px-4 py-2 font-medium">{p.full_name}</td>
                <td className="px-4 py-2 text-gray-600 capitalize">{p.position}</td>
                <td className="px-4 py-2">{p.jersey_number ?? "—"}</td>
                <td className="px-4 py-2">{p.in_wc_prelista_2026 ? "✓" : "—"}</td>
                <td className="px-4 py-2">{p.active ? "✓" : "—"}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    className="text-[#001e62] hover:underline text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
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
              Editar: {editing.full_name}
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1">Número de camiseta</label>
              <input
                type="number"
                min={1}
                max={99}
                value={editing.jersey_number ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, jersey_number: e.target.value ? Number(e.target.value) : null })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.in_wc_prelista_2026}
                onChange={(e) => setEditing({ ...editing, in_wc_prelista_2026: e.target.checked })}
                className="accent-[#001e62]"
              />
              En prelista 2026
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="accent-[#001e62]"
              />
              Activo
            </label>
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
