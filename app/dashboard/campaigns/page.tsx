"use client";

import { useEffect, useState } from "react";
import { supabase, Campaign } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import CampaignForm from "@/components/CampaignForm";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    supabase
      .from("campaigns")
      .select("*")
      .order("sent_at", { ascending: false })
      .then(({ data }) => setCampaigns((data as Campaign[]) || []));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Campanas</h1>
        <p className="text-[#666] mt-1">Envia promociones a tus clientes suscritos</p>
      </div>
      <CampaignForm />
      {campaigns.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Historial</h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#2a2a2a]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#888]">Titulo</th>
                  <th className="text-left px-4 py-3 font-medium text-[#888]">Mensaje</th>
                  <th className="text-left px-4 py-3 font-medium text-[#888]">Enviada</th>
                  <th className="text-left px-4 py-3 font-medium text-[#888]">Destinatarios</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#222] transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{c.title}</td>
                    <td className="px-4 py-3 text-[#888] max-w-xs truncate">{c.message}</td>
                    <td className="px-4 py-3 text-[#666]">{c.sent_at ? formatDate(c.sent_at) : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="bg-[#ff4d00]/10 text-[#ff4d00] px-2 py-0.5 rounded-full text-xs font-medium">
                        {c.recipient_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
