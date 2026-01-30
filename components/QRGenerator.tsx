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
    QRCode.toDataURL(link, { width: 400, margin: 2 }).then(setQrDataUrl);
  }, [phone, defaultMessage]);

  function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qr-whatsapp.png";
    a.click();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Número de WhatsApp (con código país)</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
          placeholder="34612345678"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Mensaje predeterminado</label>
        <input
          type="text"
          value={defaultMessage}
          onChange={(e) => setDefaultMessage(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      {qrDataUrl && (
        <div className="text-center space-y-3">
          <img src={qrDataUrl} alt="QR WhatsApp" className="mx-auto rounded-lg" />
          <p className="text-xs text-gray-500 break-all">{waLink}</p>
          <button
            onClick={downloadQR}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Descargar QR
          </button>
        </div>
      )}
    </div>
  );
}
