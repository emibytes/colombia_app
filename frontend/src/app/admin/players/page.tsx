"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { adminApi, AdminPlayer, AdminFederation } from "@/lib/adminApi";

const POSITIONS = [
  { value: "goalkeeper",  label: "Portero"       },
  { value: "defender",    label: "Defensa"        },
  { value: "midfielder",  label: "Mediocampista"  },
  { value: "forward",     label: "Delantero"      },
];

const INPUT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] placeholder-[#6B7280]/40 focus:outline-none focus:border-[rgba(252,209,22,0.5)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.05)] transition-all duration-300";

const SELECT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[rgba(252,209,22,0.5)] transition-all duration-300 appearance-none";

const POS_BADGE: Record<string, string> = {
  goalkeeper: "badge-GK", defender: "badge-DEF", midfielder: "badge-MID", forward: "badge-FWD",
};
const POS_SHORT: Record<string, string> = {
  goalkeeper: "POR", defender: "DEF", midfielder: "MED", forward: "DEL",
};

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
        jersey_number: editing.jersey_number,
        active: editing.active,
        in_wc_prelista_2026: editing.in_wc_prelista_2026,
      });
      setPlayers((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally { setSaving(false); }
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
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-[#6B7280] text-sm">
      <span className="btn-spinner" style={{ borderColor: "rgba(107,114,128,0.25)", borderTopColor: "#6B7280" }} />
      Cargando jugadores…
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#F0EDE8] tracking-wide">Jugadores</h1>
          <p className="text-[#6B7280] text-xs mt-0.5">{players.length} registros</p>
        </div>
        <motion.button
          onClick={() => setCreating(true)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center gap-2 bg-[#FCD116] text-[#05080F] font-bold px-4 py-2.5 rounded-xl text-sm hover:brightness-110 transition-[filter] duration-200"
        >
          <Plus size={15} weight="bold" />Nuevo jugador
        </motion.button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[rgba(252,209,22,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-[#0C1018]">
            <thead>
              <tr className="border-b border-[rgba(252,209,22,0.07)]">
                {["#", "Nombre", "Pos.", "Camiseta", "Prelista", "Activo", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
              {players.map((p, i) => (
                <tr key={p.id} className="hover:bg-[rgba(252,209,22,0.025)] transition-colors duration-150 group">
                  <td className="px-5 py-3 text-[#6B7280] text-xs font-mono">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-[#F0EDE8] whitespace-nowrap">{p.full_name}</td>
                  <td className="px-5 py-3">
                    <span className={`${POS_BADGE[p.position] ?? ""} rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider`}>
                      {POS_SHORT[p.position] ?? p.position.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6B7280] font-mono">{p.jersey_number ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${p.in_wc_prelista_2026 ? "text-[#2DD4BF]" : "text-[#6B7280]"}`}>
                      {p.in_wc_prelista_2026 ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${p.active ? "text-[#FCD116]" : "text-[#6B7280]"}`}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => setEditing(p)} className="flex items-center gap-1 text-xs text-[#FCD116] hover:text-white transition-colors">
                        <PencilSimple size={13} weight="bold" />Editar
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="flex items-center gap-1 text-xs text-[#CE1126] hover:text-red-400 transition-colors">
                        <Trash size={13} weight="bold" />Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal editar */}
      <AnimatePresence>
        {editing && (
          <AdminModal title={`Editar: ${editing.full_name}`} onClose={() => setEditing(null)}>
            <FormField label="Número de camiseta">
              <input type="number" min={1} max={99} value={editing.jersey_number ?? ""}
                onChange={(e) => setEditing({ ...editing, jersey_number: e.target.value ? Number(e.target.value) : null })}
                className={INPUT_CLS} />
            </FormField>
            <div className="space-y-3">
              <Toggle
                checked={editing.in_wc_prelista_2026}
                onChange={(v) => setEditing({ ...editing, in_wc_prelista_2026: v })}
                label="En prelista 2026"
              />
              <Toggle
                checked={editing.active}
                onChange={(v) => setEditing({ ...editing, active: v })}
                label="Jugador activo"
              />
            </div>
            <ModalActions onCancel={() => setEditing(null)} onConfirm={handleUpdate} saving={saving} label="Guardar" />
          </AdminModal>
        )}
      </AnimatePresence>

      {/* Modal crear */}
      <AnimatePresence>
        {creating && (
          <AdminModal title="Nuevo jugador" onClose={() => setCreating(false)}>
            <FormField label="Federación">
              <select value={newForm.federation_id}
                onChange={(e) => setNewForm({ ...newForm, federation_id: Number(e.target.value) })}
                className={SELECT_CLS}>
                {federations.map((f) => (
                  <option key={f.id} value={f.id}>{f.country} ({f.country_code})</option>
                ))}
              </select>
            </FormField>
            <FormField label="Nombre">
              <input type="text" value={newForm.first_name}
                onChange={(e) => setNewForm({ ...newForm, first_name: e.target.value })}
                className={INPUT_CLS} />
            </FormField>
            <FormField label="Apellido">
              <input type="text" value={newForm.last_name}
                onChange={(e) => setNewForm({ ...newForm, last_name: e.target.value })}
                className={INPUT_CLS} />
            </FormField>
            <FormField label="Posición">
              <select value={newForm.position}
                onChange={(e) => setNewForm({ ...newForm, position: e.target.value })}
                className={SELECT_CLS}>
                {POSITIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Camiseta (opcional)">
              <input type="number" min={1} max={99} value={newForm.jersey_number}
                onChange={(e) => setNewForm({ ...newForm, jersey_number: e.target.value })}
                className={INPUT_CLS} />
            </FormField>
            <ModalActions onCancel={() => setCreating(false)} onConfirm={handleCreate}
              saving={saving} disabled={!newForm.first_name.trim() || !newForm.last_name.trim()} label="Crear" />
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[#0C1018] border border-[rgba(252,209,22,0.1)] rounded-2xl p-6 w-full max-w-sm shadow-[0_0_80px_rgba(0,0,0,0.7)] space-y-4 max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#F0EDE8] tracking-wide">{title}</h2>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#F0EDE8] transition-colors p-1"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-[#F0EDE8]/80 group-hover:text-[#F0EDE8] transition-colors">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-none ${checked ? "bg-[#FCD116]" : "bg-[#1C2333]"}`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </div>
    </label>
  );
}

function ModalActions({ onCancel, onConfirm, saving, disabled, label }: {
  onCancel: () => void; onConfirm: () => void; saving: boolean; disabled?: boolean; label: string;
}) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button onClick={onCancel} className="text-sm text-[#6B7280] hover:text-[#F0EDE8] transition-colors">Cancelar</button>
      <motion.button onClick={onConfirm} disabled={saving || disabled}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="bg-[#FCD116] text-[#05080F] font-bold px-5 py-2 rounded-xl text-sm hover:brightness-110 transition-[filter] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
        {saving
          ? <><span className="btn-spinner" style={{ borderColor: "rgba(5,8,15,0.2)", borderTopColor: "#05080F" }} />{label === "Guardar" ? "Guardando…" : "Creando…"}</>
          : label}
      </motion.button>
    </div>
  );
}
