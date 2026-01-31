"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";

type Message = {
  id: string;
  direction: "in" | "out";
  content: string;
  created_at: string;
  contacts: { name: string | null; phone: string } | null;
};

export default function RecentMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    supabase
      .from("messages_log")
      .select("id, direction, content, created_at, contacts(name, phone)")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setMessages((data as unknown as Message[]) || []));
  }, []);

  if (messages.length === 0) {
    return (
      <div className="text-center py-6 text-[#555] text-sm">
        No hay mensajes recientes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#111] border border-[#2a2a2a]"
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.direction === "in"
                ? "bg-[#25D366]/10 text-[#25D366]"
                : "bg-[#ff4d00]/10 text-[#ff4d00]"
            }`}
          >
            {msg.direction === "in" ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white truncate">
                {msg.contacts?.name || msg.contacts?.phone || "Desconocido"}
              </span>
              <span className="text-[10px] text-[#555] flex-shrink-0">
                {formatDate(msg.created_at)}
              </span>
            </div>
            <p className="text-xs text-[#888] truncate">
              {msg.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
