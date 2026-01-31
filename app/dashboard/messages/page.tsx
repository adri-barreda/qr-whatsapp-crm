"use client";

import { useEffect, useState } from "react";
import { supabase, Contact } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type Message = {
  id: string;
  direction: "in" | "out";
  content: string;
  created_at: string;
};

export default function MessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("contacts")
      .select("*")
      .order("last_message_at", { ascending: false })
      .then(({ data }) => setContacts((data as Contact[]) || []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    supabase
      .from("messages_log")
      .select("id, direction, content, created_at")
      .eq("contact_id", selected)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) || []));
  }, [selected]);

  const filtered = contacts.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selectedContact = contacts.find((c) => c.id === selected);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Mensajes</h1>
      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Contact list */}
        <div className="w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex flex-col">
          <div className="p-3 border-b border-[#2a2a2a]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar contacto..."
              className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#ff4d00]"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-[#2a2a2a] transition-all ${
                  selected === c.id
                    ? "bg-[#ff4d00]/10 border-l-2 border-l-[#ff4d00]"
                    : "hover:bg-[#222]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">
                    {c.name || c.phone}
                  </span>
                  {c.subscribed && (
                    <span className="w-2 h-2 rounded-full bg-[#25D366] flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[#666] mt-0.5">{c.phone}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex flex-col">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">{selectedContact?.name || selectedContact?.phone}</h3>
                  <p className="text-xs text-[#666]">{selectedContact?.phone}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.direction === "out"
                          ? "bg-[#ff4d00] text-white rounded-br-md"
                          : "bg-[#222] text-[#ccc] border border-[#333] rounded-bl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.direction === "out" ? "text-white/60" : "text-[#555]"}`}>
                        {formatDate(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#555]">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                <p>Selecciona un contacto para ver la conversacion</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
