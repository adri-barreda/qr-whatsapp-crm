"use client";

import QRGenerator from "@/components/QRGenerator";

export default function QRPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Generar QR</h1>
      <p className="text-gray-600 mb-4">
        Configura tu número y mensaje. El QR llevará al cliente directamente a WhatsApp.
      </p>
      <QRGenerator />
    </div>
  );
}
