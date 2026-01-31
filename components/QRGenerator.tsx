"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";

export default function QRGenerator() {
  const [phone, setPhone] = useState(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "");
  const [defaultMessage, setDefaultMessage] = useState("Hola, quiero ver la carta de Delito Burguer Club!");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [waLink, setWaLink] = useState("");

  useEffect(() => {
    if (!phone) return;
    const encoded = encodeURIComponent(defaultMessage);
    const link = `https://wa.me/${phone}?text=${encoded}`;
    setWaLink(link);
    QRCode.toDataURL(link, {
      width: 400,
      margin: 2,
      color: { dark: "#ffffff", light: "#00000000" },
    }).then(setQrDataUrl);
  }, [phone, defaultMessage]);

  function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qr-delito-burguer.png";
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
      {qrDataUrl && (
        <div className="text-center space-y-4 pt-2">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 inline-block">
            <img src={qrDataUrl} alt="QR WhatsApp" className="mx-auto rounded-lg" />
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff4d00] to-[#ff6b2b] flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="text-white font-bold text-sm">DELITO BURGUER CLUB</span>
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
