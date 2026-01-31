"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [phone, setPhone] = useState(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "");
  const [defaultMessage, setDefaultMessage] = useState("Hola, quiero ver la carta de Delito Burger Club!");
  const [waLink, setWaLink] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = useCallback(async () => {
    if (!phone || !canvasRef.current) return;
    const encoded = encodeURIComponent(defaultMessage);
    const link = `https://wa.me/${phone}?text=${encoded}`;
    setWaLink(link);

    const canvas = canvasRef.current;
    await QRCode.toCanvas(canvas, link, {
      width: 400,
      margin: 2,
      color: { dark: "#ffffff", light: "#00000000" },
      errorCorrectionLevel: "H",
    });

    // Draw logo in center
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => {
      const logoSize = canvas.width * 0.25;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;

      // White circle background
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, logoSize / 2 + 8, 0, Math.PI * 2);
      ctx.fillStyle = "#111111";
      ctx.fill();

      // Draw logo
      ctx.drawImage(logo, x, y, logoSize, logoSize);
    };
    logo.src = "/logo.png";
  }, [phone, defaultMessage]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  function downloadQR() {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = "qr-delito-burger.png";
    a.click();
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#aaa] mb-1">Numero de WhatsApp (con codigo pais)</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
          placeholder="34612345678"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#aaa] mb-1">Mensaje predeterminado</label>
        <input
          type="text"
          value={defaultMessage}
          onChange={(e) => setDefaultMessage(e.target.value)}
          className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
        />
      </div>
      {phone && (
        <div className="text-center space-y-4 pt-2">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 inline-block">
            <canvas ref={canvasRef} className="mx-auto rounded-lg" />
            <div className="mt-4 flex items-center justify-center gap-2">
              <img src="/logo.png" alt="Delito Burger Club" className="h-8" />
            </div>
          </div>
          <p className="text-xs text-[#555] break-all px-4">{waLink}</p>
          <button
            onClick={downloadQR}
            className="bg-[#ff4d00] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#ff6b2b] transition-all shadow-lg shadow-[#ff4d00]/10"
          >
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );
}
