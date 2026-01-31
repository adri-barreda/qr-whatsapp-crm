"use client";

import QRGenerator from "@/components/QRGenerator";

export default function QRPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Generar QR</h1>
        <p className="text-[#666] mt-1">
          Configura tu numero y mensaje. El QR llevara al cliente directamente a WhatsApp.
        </p>
      </div>
      <QRGenerator />
    </div>
  );
}
