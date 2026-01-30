import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        <h1 className="text-4xl font-bold">QR WhatsApp CRM</h1>
        <p className="text-gray-600">
          Genera un QR, captura contactos por WhatsApp y envía promociones automáticas a tus clientes.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700"
        >
          Ir al panel
        </Link>
      </div>
    </div>
  );
}
