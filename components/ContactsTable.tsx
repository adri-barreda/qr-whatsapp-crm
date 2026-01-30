"use client";

import { Contact } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type Props = {
  contacts: Contact[];
};

export default function ContactsTable({ contacts }: Props) {
  if (contacts.length === 0) {
    return <p className="text-gray-500 text-center py-8">No hay contactos aún.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Nombre</th>
            <th className="text-left px-4 py-3 font-medium">Teléfono</th>
            <th className="text-left px-4 py-3 font-medium">Suscrito</th>
            <th className="text-left px-4 py-3 font-medium">Fecha</th>
            <th className="text-left px-4 py-3 font-medium">Último mensaje</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3">{c.name || "—"}</td>
              <td className="px-4 py-3 font-mono">{c.phone}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    c.subscribed
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {c.subscribed ? "Sí" : "No"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
              <td className="px-4 py-3 text-gray-500">{formatDate(c.last_message_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
