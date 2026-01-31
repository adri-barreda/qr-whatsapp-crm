"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatsCards from "@/components/StatsCards";
import RecentMessages from "@/components/RecentMessages";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, subscribed: 0, campaigns: 0, messages: 0 });
  const [messagesOpen, setMessagesOpen] = useState(true);

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

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
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
      <div className="mt-4 flex-1 min-h-0 flex flex-col">
        <button
          onClick={() => setMessagesOpen(!messagesOpen)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h2 className="text-lg font-semibold text-white">Actividad reciente</h2>
          <svg
            className={`w-5 h-5 text-[#666] transition-transform ${messagesOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {messagesOpen && (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <RecentMessages />
          </div>
        )}
      </div>
    </div>
  );
}
