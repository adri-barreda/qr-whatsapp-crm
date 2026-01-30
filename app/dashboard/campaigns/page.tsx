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
      <h1 className="text-2xl font-bold mb-6">Campañas</h1>
      <CampaignForm />
      {campaigns.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Historial</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Título</th>
                  <th className="text-left px-4 py-3 font-medium">Mensaje</th>
                  <th className="text-left px-4 py-3 font-medium">Enviada</th>
                  <th className="text-left px-4 py-3 font-medium">Destinatarios</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{c.title}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{c.message}</td>
                    <td className="px-4 py-3 text-gray-500">{c.sent_at ? formatDate(c.sent_at) : "—"}</td>
                    <td className="px-4 py-3">{c.recipient_count}</td>
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
