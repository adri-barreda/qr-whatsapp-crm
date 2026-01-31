"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import StatsCards from "@/components/StatsCards";
import RecentMessages from "@/components/RecentMessages";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, subscribed: 0, campaigns: 0, messages: 0 });
  const [messagesOpen, setMessagesOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState(300);

  useEffect(() => {
    async function load() {
      const [contacts, subscribed, campaigns, messages] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }).eq("subscribed", true),
        supabase.from("campaigns").select("id", { count: "exact", head: true }),
        supabase.from("messages_log").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        total: contacts.count || 0,
        subscribed: subscribed.count || 0,
        campaigns: campaigns.count || 0,
        messages: messages.count || 0,
      });
    }
    load();
  }, []);

  useEffect(() => {
    if (messagesOpen && messagesRef.current) {
      const rect = messagesRef.current.getBoundingClientRect();
      const available = window.innerHeight - rect.top - 24;
      setMaxH(Math.max(available, 100));
    }
  }, [messagesOpen]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#666] mt-1">Resumen de tu CRM de WhatsApp</p>
      </div>
      <StatsCards
        totalContacts={stats.total}
        subscribedContacts={stats.subscribed}
        totalCampaigns={stats.campaigns}
        totalMessages={stats.messages}
      />
      <div className="mt-6" ref={containerRef}>
        <button
          onClick={() => setMessagesOpen(!messagesOpen)}
          className="flex items-center gap-2 w-full text-left"
        >
          <svg
            className={`w-4 h-4 text-[#666] transition-transform ${messagesOpen ? "rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
          <span className="text-xs text-[#555]">({stats.messages})</span>
        </button>
        {messagesOpen && (
          <div
            ref={messagesRef}
            className="mt-3 overflow-y-auto"
            style={{ maxHeight: `${maxH}px` }}
          >
            <RecentMessages />
          </div>
        )}
      </div>
    </div>
  );
}
