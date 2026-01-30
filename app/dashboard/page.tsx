"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatsCards from "@/components/StatsCards";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, subscribed: 0, campaigns: 0 });

  useEffect(() => {
    async function load() {
      const [contacts, subscribed, campaigns] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }).eq("subscribed", true),
        supabase.from("campaigns").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        total: contacts.count || 0,
        subscribed: subscribed.count || 0,
        campaigns: campaigns.count || 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <StatsCards
        totalContacts={stats.total}
        subscribedContacts={stats.subscribed}
        totalCampaigns={stats.campaigns}
      />
    </div>
  );
}
