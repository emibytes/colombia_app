"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { adminApi, AdminFederationRow, AdminConfederation } from "@/lib/adminApi";

const INPUT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] placeholder-[#6B7280]/40 focus:outline-none focus:border-[rgba(252,209,22,0.5)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.05)] transition-all duration-300";

const SELECT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[rgba(252,209,22,0.5)] transition-all duration-300 appearance-none";

type NewForm = {
  confederation_id: number | null;
  name: string;
  short_name: string;
  country: string;
  country_code: string;
  continent: string;
  head_coach: string;
  fifa_ranking: string;
  founded_year: string;
  qualified_wc_2026: boolean;
};

const emptyForm: NewForm = {
  confederation_id: null, name: "", short_name: "",
  country: "", country_code: "", continent: "",
  head_coach: "", fifa_ranking: "", founded_year: "",
  qualified_wc_2026: false,
};

export default function AdminFederationsPage() {
  const [items, setItems]          = useState<AdminFederationRow[]>([]);
  const [confederations, setConfs] = useState<AdminConfederation[]>([]);
  const [loading, setLoading]      = useState(true);
  const [editing, setEditing]      = useState<AdminFederationRow | null>(null);
  const [creating, setCreating]    = useState(false);
  const [saving, setSaving]        = useState(false);
  const [newForm, setNewForm]      = useState<NewForm>({ ...emptyForm });

  useEffect(() => {
    Promise.all([adminApi.getAdminFederations(), adminApi.getConfederations()])
      .then(([feds, confs]) => { setItems(feds); setConfs(confs); })
      .finally(() => setLoading(false));
  }, []);

  function confName(id: number | null) {
    return confederations.find((c) => c.id === id)?.name ?? null;
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar federación?")) return;
    await adminApi.deleteFederation(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  async function handleUpdate() {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await adminApi.updateFederation(editing.id, {
        confederation_id: editing.confederation_id,
        name: editing.name, short_name: editing.short_name,
        country: editing.country, country_code: editing.country_code,
        continent: editing.continent, fifa_ranking: editing.fifa_ranking,
        qualified_wc_2026: editing.qualified_wc_2026, head_coach: editing.head_coach,
        founded_year: editing.founded_year,
      });
      setItems((prev) => prev.map((x) =>
        x.id === updated.id ? { ...updated, confederation_name: confName(updated.confederation_id) } : x
      ));
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function handleCreate() {
    if (!newForm.name.trim() || !newForm.short_name.trim() || !newForm.country.trim() ||
        !newForm.country_code.trim() || !newForm.continent.trim() || !newForm.confederation_id) return;
    setSaving(true);
    try {
      const created = await adminApi.createFederation({
        confederation_id:  newForm.confederation_id,
        name:              newForm.name.trim(),
        short_name:        newForm.short_name.trim(),
        country:           newForm.country.trim(),
        country_code:      newForm.country_code.trim().toUpperCase(),
        continent:         newForm.continent.trim(),
        head_coach:        newForm.head_coach.trim() || null,
        fifa_ranking:      newForm.fifa_ranking ? Number(newForm.fifa_ranking) : null,
        founded_year:      newForm.founded_year  ? Number(newForm.founded_year)  : null,
        qualified_wc_2026: newForm.qualified_wc_2026,
      });
      setItems((prev) => [...prev, { ...created, confederation_name: confName(created.confederation_id) }]);
      setCreating(false);
      setNewForm({ ...emptyForm });
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-[#6B7280] text-sm">
      <span className="btn-spinner" style={{ borderColor: "rgba(107,114,128,0.25)", borderTopColor: "#6B7280" }} />
      Cargando federaciones…
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#F0EDE8] tracking-wide">Federaciones</h1>
          <p className="text-[#6B7280] text-xs mt-0.5">{items.length} registros</p>
        </div>
        <motion.button onClick={() => setCreating(true)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center gap-2 bg-[#FCD116] text-[#05080F] font-bold px-4 py-2.5 rounded-xl text-sm hover:brightness-110 transition-[filter] duration-200">
          <Plus size={15} weight="bold" />Nueva federación
        </motion.button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[rgba(252,209,22,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-[#0C1018]">
            <thead>
              <tr className="border-b border-[rgba(252,209,22,0.07)]">
                {["Nombre", "Código", "Confederación", "Ranking FIFA", "Clasificado", "DT", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
              {items.map((f) => (
                <tr key={f.id} className="hover:bg-[rgba(252,209,22,0.025)] transition-colors duration-150 group">
                  <td className="px-5 py-3 font-medium text-[#F0EDE8] whitespace-nowrap">{f.name}</td>
                  <td className="px-5 py-3 font-mono text-xs font-bold text-[#FCD116]">{f.country_code}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{f.confederation_name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-[#6B7280]">{f.fifa_ranking ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold ${f.qualified_wc_2026 ? "text-[#2DD4BF]" : "text-[#6B7280]"}`}>
                      {f.qualified_wc_2026 ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#6B7280] text-xs">{f.head_coach ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => setEditing(f)} className="flex items-center gap-1 text-xs text-[#FCD116] hover:text-white transition-colors">
                        <PencilSimple size={13} weight="bold" />Editar
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="flex items-center gap-1 text-xs text-[#CE1126] hover:text-red-400 transition-colors">
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

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <AdminModal title={`Editar: ${editing.name}`} onClose={() => setEditing(null)}>
            <FormField label="Confederación *">
              <select value={editing.confederation_id ?? ""}
                onChange={(e) => setEditing({ ...editing, confederation_id: Number(e.target.value) })}
                className={SELECT_CLS}>
                {confederations.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            {(["name","short_name","country","country_code","continent","head_coach"] as const).map((key) => (
              <FormField key={key} label={key.replace(/_/g, " ")}>
                <input type="text" value={(editing[key] as string | null) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value || null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            {(["fifa_ranking","founded_year"] as const).map((key) => (
              <FormField key={key} label={key.replace(/_/g, " ")}>
                <input type="number" value={(editing[key] as number | null) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value ? Number(e.target.value) : null })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            <Toggle checked={editing.qualified_wc_2026}
              onChange={(v) => setEditing({ ...editing, qualified_wc_2026: v })}
              label="Clasificado WC 2026" />
            <ModalActions onCancel={() => setEditing(null)} onConfirm={handleUpdate} saving={saving} label="Guardar" />
          </AdminModal>
        )}
      </AnimatePresence>

      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <AdminModal title="Nueva federación" onClose={() => setCreating(false)}>
            <FormField label="Confederación *">
              <select value={newForm.confederation_id ?? ""}
                onChange={(e) => setNewForm({ ...newForm, confederation_id: e.target.value ? Number(e.target.value) : null })}
                className={SELECT_CLS}>
                <option value="">Seleccionar…</option>
                {confederations.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            {(["name","short_name","country","country_code","continent","head_coach"] as const).map((key) => (
              <FormField key={key} label={`${key.replace(/_/g, " ")}${["name","short_name","country","country_code","continent"].includes(key) ? " *" : ""}`}>
                <input type="text" value={newForm[key]}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            {(["fifa_ranking","founded_year"] as const).map((key) => (
              <FormField key={key} label={key.replace(/_/g, " ")}>
                <input type="number" value={newForm[key]}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className={INPUT_CLS} />
              </FormField>
            ))}
            <Toggle checked={newForm.qualified_wc_2026}
              onChange={(v) => setNewForm({ ...newForm, qualified_wc_2026: v })}
              label="Clasificado WC 2026" />
            <ModalActions onCancel={() => setCreating(false)} onConfirm={handleCreate}
              saving={saving}
              disabled={!newForm.name.trim() || !newForm.short_name.trim() || !newForm.country.trim() ||
                        !newForm.country_code.trim() || !newForm.continent.trim() || !newForm.confederation_id}
              label="Crear" />
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
        initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[#0C1018] border border-[rgba(252,209,22,0.1)] rounded-2xl p-6 w-full max-w-sm shadow-[0_0_80px_rgba(0,0,0,0.7)] space-y-4 max-h-[90dvh] overflow-y-auto">
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
      <div onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-none cursor-pointer ${checked ? "bg-[#FCD116]" : "bg-[#1C2333]"}`}>
        <motion.div animate={{ x: checked ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
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
