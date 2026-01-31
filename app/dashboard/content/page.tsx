"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const KEYS = [
  { key: "burger_mes_texto", label: "Texto burger del mes", type: "textarea" },
  { key: "burger_mes_imagen", label: "URL imagen burger del mes", type: "input" },
  { key: "carta_url", label: "URL carta (PDF)", type: "input" },
  { key: "recomendaciones", label: "Recomendaciones", type: "textarea" },
  { key: "ofertas", label: "Ofertas", type: "textarea" },
] as const;

export default function ContentPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("settings").select("key, value").then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        for (const row of data) map[row.key] = row.value;
        setValues(map);
      }
    });
  }, []);

  async function save(key: string) {
    setSaving(key);
    setSaved(null);
    await supabase.from("settings").upsert(
      { key, value: values[key] || "", updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Contenido del Bot</h1>
      <p className="text-[#888] text-sm">
        Edita el contenido que envía el bot de WhatsApp. Los cambios se aplican al instante.
      </p>

      {KEYS.map(({ key, label, type }) => (
        <div key={key} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 space-y-4">
          <label className="block text-sm font-medium text-[#ccc]">{label}</label>
          {type === "textarea" ? (
            <textarea
              className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white text-sm min-h-[120px] focus:outline-none focus:border-[#ff4d00]"
              value={values[key] || ""}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
          ) : (
            <input
              className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-[#ff4d00]"
              value={values[key] || ""}
              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
            />
          )}
          <button
            onClick={() => save(key)}
            disabled={saving === key}
            className="px-4 py-2 bg-[#ff4d00] text-white text-sm font-medium rounded-lg hover:bg-[#ff6a2a] disabled:opacity-50 transition-colors"
          >
            {saving === key ? "Guardando..." : saved === key ? "Guardado ✓" : "Guardar"}
          </button>
        </div>
      ))}
    </div>
  );
}
