"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatsCards from "@/components/StatsCards";
import RecentMessages from "@/components/RecentMessages";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, subscribed: 0, campaigns: 0, messages: 0 });

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
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-[#666] mt-1">Resumen de tu CRM de WhatsApp</p>
      </div>
      <StatsCards
        totalContacts={stats.total}
        subscribedContacts={stats.subscribed}
        totalCampaigns={stats.campaigns}
        totalMessages={stats.messages}
      />
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4">Actividad reciente</h2>
        <RecentMessages />
      </div>
    </div>
  );
}
