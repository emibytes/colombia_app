"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { adminApi, AdminClub, AdminFederation } from "@/lib/adminApi";

const TEXT_FIELDS = [
  { label: "Nombre *",    key: "name",         placeholder: "Millonarios FC"           },
  { label: "Abreviatura", key: "short_name",   placeholder: "MFC"                      },
  { label: "País",        key: "country",      placeholder: "Colombia"                 },
  { label: "Código país", key: "country_code", placeholder: "COL"                      },
  { label: "Ciudad",      key: "city",         placeholder: "Bogotá"                   },
  { label: "Liga",        key: "league_name",  placeholder: "Liga BetPlay Dimayor"     },
  { label: "Estadio",     key: "stadium_name", placeholder: "Estadio El Campín"        },
  { label: "Logo URL",    key: "logo_url",     placeholder: "https://..."              },
  { label: "Sitio web",   key: "website",      placeholder: "https://millonarios.com"  },
] as const;

const NUM_FIELDS = [
  { label: "Capacidad estadio", key: "stadium_capacity" },
  { label: "Año de fundación",  key: "founded_year"     },
] as const;

type TextKey = typeof TEXT_FIELDS[number]["key"];
type NumKey  = typeof NUM_FIELDS[number]["key"];
type NewForm = Record<TextKey | NumKey, string> & { federation_id: string };

const INPUT_CLS =
  "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] placeholder-[#6B7280]/40 focus:outline-none focus:border-[rgba(252,209,22,0.5)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.05)] transition-all duration-300";

export default function AdminClubsPage() {
  const [clubs, setClubs]               = useState<AdminClub[]>([]);
  const [federations, setFederations]   = useState<AdminFederation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [editing, setEditing]           = useState<AdminClub | null>(null);
  const [creating, setCreating]         = useState(false);
  const [saving, setSaving]             = useState(false);

  const emptyForm: NewForm = {
    federation_id: "", name: "", short_name: "", country: "", country_code: "",
    city: "", stadium_name: "", stadium_capacity: "", founded_year: "",
    league_name: "", logo_url: "", website: "",
  };
  const [newForm, setNewForm] = useState<NewForm>(emptyForm);

  useEffect(() => {
    Promise.all([adminApi.getClubs(), adminApi.getFederations()])
      .then(([c, f]) => { setClubs(c); setFederations(f); })
      .finally(() => setLoading(false));
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
        federation_id:    editing.federation_id,
        name:             editing.name,
        short_name:       editing.short_name,
        country:          editing.country,
        country_code:     editing.country_code,
        city:             editing.city,
        stadium_name:     editing.stadium_name,
        stadium_capacity: editing.stadium_capacity,
        founded_year:     editing.founded_year,
        league_name:      editing.league_name,
        logo_url:         editing.logo_url,
        website:          editing.website,
      });
      setClubs((c) => c.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
    } finally { setSaving(false); }
  }

  async function handleCreate() {
    if (!newForm.name.trim()) return;
    setSaving(true);
    try {
      const created = await adminApi.createClub({
        federation_id:    newForm.federation_id ? Number(newForm.federation_id) : null,
        name:             newForm.name.trim(),
        short_name:       newForm.short_name       || null,
        country:          newForm.country          || null,
        country_code:     newForm.country_code     || null,
        city:             newForm.city             || null,
        stadium_name:     newForm.stadium_name     || null,
        stadium_capacity: newForm.stadium_capacity ? Number(newForm.stadium_capacity) : null,
        founded_year:     newForm.founded_year     ? Number(newForm.founded_year)     : null,
        league_name:      newForm.league_name      || null,
        logo_url:         newForm.logo_url         || null,
        website:          newForm.website          || null,
      });
      setClubs((c) => [...c, created]);
      setCreating(false);
      setNewForm(emptyForm);
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center gap-3 text-[#6B7280] text-sm">
      <span className="btn-spinner" style={{ borderColor: "rgba(107,114,128,0.25)", borderTopColor: "#6B7280" }} />
      Cargando clubes…
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bebas)] text-4xl text-[#F0EDE8] tracking-wide">Clubes</h1>
          <p className="text-[#6B7280] text-xs mt-0.5">{clubs.length} registros</p>
        </div>
        <motion.button
          onClick={() => setCreating(true)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center gap-2 bg-[#FCD116] text-[#05080F] font-bold px-4 py-2.5 rounded-xl text-sm hover:brightness-110 transition-[filter] duration-200"
        >
          <Plus size={15} weight="bold" />Nuevo club
        </motion.button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[rgba(252,209,22,0.07)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm bg-[#0C1018]">
            <thead>
              <tr className="border-b border-[rgba(252,209,22,0.07)]">
                {["Nombre", "Abrev.", "Federación", "País", "Ciudad", "Liga", ""].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] uppercase tracking-[0.15em] font-semibold text-[#6B7280] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
              {clubs.map((c) => (
                <tr key={c.id} className="hover:bg-[rgba(252,209,22,0.025)] transition-colors duration-150 group">
                  <td className="px-5 py-3 font-medium text-[#F0EDE8] whitespace-nowrap">{c.name}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{c.short_name ?? "—"}</td>
                  <td className="px-5 py-3 text-[#6B7280] whitespace-nowrap">
                    {c.federation ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[10px] bg-[rgba(252,209,22,0.1)] text-[#FCD116] px-1.5 py-0.5 rounded font-bold">
                          {c.federation.country_code}
                        </span>
                        <span className="text-xs">{c.federation.short_name}</span>
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-[#6B7280]">{c.country ?? "—"}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{c.city ?? "—"}</td>
                  <td className="px-5 py-3 text-[#6B7280]">{c.league_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => setEditing(c)} className="flex items-center gap-1 text-xs text-[#FCD116] hover:text-white transition-colors">
                        <PencilSimple size={13} weight="bold" />Editar
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1 text-xs text-[#CE1126] hover:text-red-400 transition-colors">
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
            <FederationSelect
              value={editing.federation_id}
              federations={federations}
              onChange={(id) => setEditing({ ...editing, federation_id: id })}
            />
            {TEXT_FIELDS.map(({ label, key }) => (
              <FormField key={key} label={label}>
                <input
                  type="text"
                  value={(editing[key as keyof AdminClub] as string | null) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value || null })}
                  className={INPUT_CLS}
                />
              </FormField>
            ))}
            {NUM_FIELDS.map(({ label, key }) => (
              <FormField key={key} label={label}>
                <input
                  type="number"
                  value={(editing[key as keyof AdminClub] as number | null) ?? ""}
                  onChange={(e) => setEditing({ ...editing, [key]: e.target.value ? Number(e.target.value) : null })}
                  className={INPUT_CLS}
                />
              </FormField>
            ))}
            <ModalActions onCancel={() => setEditing(null)} onConfirm={handleUpdate} saving={saving} label="Guardar" />
          </AdminModal>
        )}
      </AnimatePresence>

      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <AdminModal title="Nuevo club" onClose={() => setCreating(false)}>
            <FederationSelect
              value={newForm.federation_id ? Number(newForm.federation_id) : null}
              federations={federations}
              onChange={(id) => setNewForm({ ...newForm, federation_id: id ? String(id) : "" })}
            />
            {TEXT_FIELDS.map(({ label, key, placeholder }) => (
              <FormField key={key} label={label}>
                <input
                  type="text"
                  value={newForm[key]}
                  placeholder={placeholder}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className={INPUT_CLS}
                />
              </FormField>
            ))}
            {NUM_FIELDS.map(({ label, key }) => (
              <FormField key={key} label={label}>
                <input
                  type="number"
                  value={newForm[key]}
                  onChange={(e) => setNewForm({ ...newForm, [key]: e.target.value })}
                  className={INPUT_CLS}
                />
              </FormField>
            ))}
            <ModalActions
              onCancel={() => setCreating(false)}
              onConfirm={handleCreate}
              saving={saving}
              disabled={!newForm.name.trim()}
              label="Crear"
            />
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
}

function FederationSelect({
  value, federations, onChange,
}: { value: number | null; federations: AdminFederation[]; onChange: (id: number | null) => void }) {
  const SELECT_CLS =
    "w-full bg-[#111620] border border-[rgba(252,209,22,0.1)] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[rgba(252,209,22,0.5)] focus:shadow-[0_0_0_3px_rgba(252,209,22,0.05)] transition-all duration-300 cursor-pointer";
  return (
    <FormField label="Federación">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className={SELECT_CLS}
      >
        <option value="">Sin federación</option>
        {federations.map((f) => (
          <option key={f.id} value={f.id}>
            {f.country} ({f.country_code})
          </option>
        ))}
      </select>
    </FormField>
  );
}

function AdminModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="bg-[#0C1018] border border-[rgba(252,209,22,0.1)] rounded-2xl p-6 w-full max-w-md shadow-[0_0_80px_rgba(0,0,0,0.7)] space-y-4 my-auto"
      >
        <div className="flex items-center justify-between mb-2">
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
