"use client";

import { Contact } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type Props = {
  contacts: Contact[];
};

export default function ContactsTable({ contacts }: Props) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-12 text-[#555]">
        <svg className="w-12 h-12 mx-auto mb-3 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        No hay contactos aun.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
      <table className="w-full text-sm">
        <thead className="border-b border-[#2a2a2a]">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-[#888]">Nombre</th>
            <th className="text-left px-4 py-3 font-medium text-[#888]">Telefono</th>
            <th className="text-left px-4 py-3 font-medium text-[#888]">Estado</th>
            <th className="text-left px-4 py-3 font-medium text-[#888]">Fecha</th>
            <th className="text-left px-4 py-3 font-medium text-[#888]">Ultimo mensaje</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#222] transition-colors">
              <td className="px-4 py-3 text-white font-medium">{c.name || "—"}</td>
              <td className="px-4 py-3 font-mono text-[#aaa]">{c.phone}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    c.subscribed
                      ? "bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20"
                      : "bg-[#333] text-[#888] border border-[#444]"
                  }`}
                >
                  {c.subscribed ? "Suscrito" : "No suscrito"}
                </span>
              </td>
              <td className="px-4 py-3 text-[#666]">{formatDate(c.created_at)}</td>
              <td className="px-4 py-3 text-[#666]">{formatDate(c.last_message_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
