"use client";

type Props = {
  totalContacts: number;
  subscribedContacts: number;
  totalCampaigns: number;
};

export default function StatsCards({
  totalContacts,
  subscribedContacts,
  totalCampaigns,
}: Props) {
  const cards = [
    { label: "Contactos totales", value: totalContacts, color: "bg-blue-500" },
    { label: "Suscritos", value: subscribedContacts, color: "bg-green-500" },
    { label: "Campañas enviadas", value: totalCampaigns, color: "bg-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl shadow-sm border p-6">
          <div className={`w-3 h-3 rounded-full ${card.color} mb-3`} />
          <p className="text-sm text-gray-500">{card.label}</p>
          <p className="text-3xl font-bold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
