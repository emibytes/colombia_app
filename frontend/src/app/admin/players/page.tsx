"use client";
import { useEffect, useState } from "react";
import { adminApi, AdminPlayer, AdminFederation } from "@/lib/adminApi";

const POSITIONS = [
  { value: "goalkeeper",  label: "Portero"      },
  { value: "defender",    label: "Defensa"       },
  { value: "midfielder",  label: "Mediocampista" },
  { value: "forward",     label: "Delantero"     },
];

export default function AdminPlayersPage() {
  const [players, setPlayers]         = useState<AdminPlayer[]>([]);
  const [federations, setFederations] = useState<AdminFederation[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState<AdminPlayer | null>(null);
  const [creating, setCreating]       = useState(false);
  const [saving, setSaving]           = useState(false);

  const [newForm, setNewForm] = useState({
    federation_id: 0,
    first_name:    "",
    last_name:     "",
    position:      "midfielder",
    jersey_number: "" as string | number,
  });

  useEffect(() => {
    Promise.all([adminApi.getPlayers(), adminApi.getFederations()])
      .then(([p, f]) => {
        setPlayers(p);
        setFederations(f);
        if (f.length > 0) setNewForm((prev) => ({ ...prev, federation_id: f[0].id }));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar jugador?")) return;
    await adminApi.deletePlayer(id);
    setPlayers((p) => p.filter((x) => x.id !== id));
  }

  async function handleUpdate() {
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

  async function handleCreate() {
    if (!newForm.first_name.trim() || !newForm.last_name.trim()) return;
    setSaving(true);
    try {
      const created = await adminApi.createPlayer({
        federation_id:       newForm.federation_id,
        first_name:          newForm.first_name.trim(),
        last_name:           newForm.last_name.trim(),
        position:            newForm.position,
        jersey_number:       newForm.jersey_number ? Number(newForm.jersey_number) : null,
        active:              true,
        in_wc_prelista_2026: true,
      });
      setPlayers((p) => [...p, created]);
      setCreating(false);
      setNewForm((f) => ({ ...f, first_name: "", last_name: "", jersey_number: "" }));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando jugadores…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62]">Jugadores</h1>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#001e62] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition"
        >
          + Nuevo jugador
        </button>
      </div>

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
                  <button onClick={() => setEditing(p)} className="text-[#001e62] hover:underline text-xs">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal editar */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">
              Editar: {editing.full_name}
            </h2>
            <div>
              <label className="block text-sm font-medium mb-1">Número de camiseta</label>
              <input
                type="number" min={1} max={99}
                value={editing.jersey_number ?? ""}
                onChange={(e) => setEditing({ ...editing, jersey_number: e.target.value ? Number(e.target.value) : null })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.in_wc_prelista_2026}
                onChange={(e) => setEditing({ ...editing, in_wc_prelista_2026: e.target.checked })}
                className="accent-[#001e62]" />
              En prelista 2026
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                className="accent-[#001e62]" />
              Activo
            </label>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleUpdate} disabled={saving}
                className="bg-[#ffd100] text-[#001e62] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50">
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">Nuevo jugador</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Federación</label>
              <select value={newForm.federation_id}
                onChange={(e) => setNewForm({ ...newForm, federation_id: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {federations.map((f) => (
                  <option key={f.id} value={f.id}>{f.country} ({f.country_code})</option>
                ))}
              </select>
            </div>
            {(["first_name", "last_name"] as const).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">
                  {key === "first_name" ? "Nombre" : "Apellido"}
                </label>
                <input type="text" value={newForm[key]}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium mb-1">Posición</label>
              <select value={newForm.position}
                onChange={(e) => setNewForm({ ...newForm, position: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Camiseta (opcional)</label>
              <input type="number" min={1} max={99} value={newForm.jersey_number}
                onChange={(e) => setNewForm({ ...newForm, jersey_number: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCreating(false)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleCreate}
                disabled={saving || !newForm.first_name.trim() || !newForm.last_name.trim()}
                className="bg-[#ffd100] text-[#001e62] font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50">
                {saving ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
