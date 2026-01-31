"use client";

import { useState } from "react";
import AIGenerateButton from "./AIGenerateButton";

type Mode = "template" | "free";

export default function CampaignForm() {
  const [mode, setMode] = useState<Mode>("template");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [templateName, setTemplateName] = useState("hello_world");
  const [templateLang, setTemplateLang] = useState("en_US");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "template"
            ? { title, template_name: templateName, template_lang: templateLang }
            : { title, message, media_url: mediaUrl || undefined }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al enviar");
      } else {
        setResult(data);
        setTitle("");
        setMessage("");
        setMediaUrl("");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 space-y-4 max-w-lg"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("template")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "template"
              ? "bg-[#ff4d00] text-white"
              : "bg-[#222] text-[#888] hover:text-white border border-[#333]"
          }`}
        >
          Plantilla aprobada
        </button>
        <button
          type="button"
          onClick={() => setMode("free")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "free"
              ? "bg-[#ff4d00] text-white"
              : "bg-[#222] text-[#888] hover:text-white border border-[#333]"
          }`}
        >
          Mensaje libre (solo 24h)
        </button>
      </div>

      <p className="text-xs text-[#555]">
        {mode === "template"
          ? "Las plantillas deben estar aprobadas en Meta Business. Funcionan en cualquier momento."
          : "Los mensajes libres solo llegan si el cliente te escribio en las ultimas 24h."}
      </p>

      <div>
        <label className="block text-sm font-medium text-[#aaa] mb-1">Titulo de la campana</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
          placeholder="Ej: Promo Fin de Semana"
        />
      </div>

      {mode === "template" ? (
        <>
          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-1">Nombre de la plantilla</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
              placeholder="hello_world"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-1">Idioma de la plantilla</label>
            <input
              type="text"
              value={templateLang}
              onChange={(e) => setTemplateLang(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
              placeholder="es"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-[#aaa]">Mensaje *</label>
              <AIGenerateButton onGenerated={(text) => setMessage(text)} />
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
              placeholder="Escribe el mensaje de la promocion..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#aaa] mb-1">URL de imagen (opcional)</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
              placeholder="https://ejemplo.com/promo.jpg"
            />
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={sending}
          className="bg-[#ff4d00] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#ff6b2b] disabled:opacity-50 transition-all shadow-lg shadow-[#ff4d00]/10"
        >
          {sending ? "Enviando..." : "Enviar a todos los suscritos"}
        </button>
        {mode === "free" && message.trim() && (
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(message);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
              window.open("https://web.whatsapp.com", "_blank");
            }}
            className="bg-[#25D366] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1da851] transition-all shadow-lg shadow-[#25D366]/10"
          >
            {copied ? "Copiado!" : "Publicar en Canal"}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {result && (
        <p className="text-[#25D366] text-sm">
          Enviado a {result.sent} contactos.{" "}
          {result.failed > 0 && `${result.failed} fallidos.`}
        </p>
      )}
    </form>
  );
}
