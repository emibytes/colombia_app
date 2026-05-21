"use client";
import { useEffect, useState } from "react";
import { adminApi, AdminClub } from "@/lib/adminApi";

const EDIT_FIELDS = [
  { label: "Nombre",      key: "name"        },
  { label: "Abreviatura", key: "short_name"  },
  { label: "Ciudad",      key: "city"        },
  { label: "Liga",        key: "league_name" },
] as const;

const CREATE_FIELDS = [
  { label: "Nombre *",    key: "name"         },
  { label: "Abreviatura", key: "short_name"   },
  { label: "País",        key: "country"      },
  { label: "Código país", key: "country_code" },
  { label: "Ciudad",      key: "city"         },
  { label: "Liga",        key: "league_name"  },
] as const;

type NewForm = Record<typeof CREATE_FIELDS[number]["key"], string>;

export default function AdminClubsPage() {
  const [clubs, setClubs]       = useState<AdminClub[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<AdminClub | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving]     = useState(false);

  const emptyForm: NewForm = { name: "", short_name: "", country: "", country_code: "", city: "", league_name: "" };
  const [newForm, setNewForm] = useState<NewForm>(emptyForm);

  useEffect(() => {
    adminApi.getClubs().then(setClubs).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar club?")) return;
    await adminApi.deleteClub(id);
    setClubs((c) => c.filter((x) => x.id !== id));
  }

  async function handleUpdate() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateClub(editing.id, {
        name: editing.name, short_name: editing.short_name,
        city: editing.city, league_name: editing.league_name,
      });
      setClubs((c) => c.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      const created = await adminApi.createClub({
        name:         newForm.name.trim(),
        short_name:   newForm.short_name   || null,
        country:      newForm.country      || null,
        country_code: newForm.country_code || null,
        city:         newForm.city         || null,
        league_name:  newForm.league_name  || null,
      });
      setClubs((c) => [...c, created]);
      setCreating(false);
      setNewForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-500">Cargando clubes…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#001e62]">Clubes</h1>
        <button
          onClick={() => setCreating(true)}
          className="bg-[#001e62] text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-900 transition"
        >
          + Nuevo club
        </button>
      </div>

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
                  <button onClick={() => setEditing(c)} className="text-[#001e62] hover:underline text-xs">Editar</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline text-xs">Eliminar</button>
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
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">Editar club</h2>
            {EDIT_FIELDS.map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="text"
                  value={(editing[key] as string) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value || null })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
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
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#001e62]">Nuevo club</h2>
            {CREATE_FIELDS.map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input type="text"
                  value={newForm[key]}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setCreating(false)} className="text-sm text-gray-500 hover:underline">Cancelar</button>
              <button onClick={handleCreate} disabled={saving || !newForm.name.trim()}
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
