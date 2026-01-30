"use client";

import { useState } from "react";

type Mode = "template" | "free";

export default function CampaignForm() {
  const [mode, setMode] = useState<Mode>("template");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [templateName, setTemplateName] = useState("hello_world");
  const [templateLang, setTemplateLang] = useState("en_US");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(
    null
  );
  const [error, setError] = useState("");

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
      setError("Error de conexión");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border p-6 space-y-4 max-w-lg"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("template")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "template"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Plantilla aprobada
        </button>
        <button
          type="button"
          onClick={() => setMode("free")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "free"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Mensaje libre (solo 24h)
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {mode === "template"
          ? "Las plantillas deben estar aprobadas en Meta Business. Funcionan en cualquier momento."
          : "Los mensajes libres solo llegan si el cliente te escribió en las últimas 24h."}
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">
          Título de la campaña
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Ej: Promo Fin de Semana"
        />
      </div>

      {mode === "template" ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre de la plantilla
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="hello_world"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Idioma de la plantilla
            </label>
            <input
              type="text"
              value={templateLang}
              onChange={(e) => setTemplateLang(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="es"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Mensaje *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Escribe el mensaje de la promoción..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              URL de imagen (opcional)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://ejemplo.com/promo.jpg"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={sending}
        className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
      >
        {sending ? "Enviando..." : "Enviar a todos los suscritos"}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {result && (
        <p className="text-green-700 text-sm">
          Enviado a {result.sent} contactos.{" "}
          {result.failed > 0 && `${result.failed} fallidos.`}
        </p>
      )}
    </form>
  );
}
