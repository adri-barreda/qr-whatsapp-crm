"use client";

import { useEffect, useState } from "react";
import { supabase, Contact } from "@/lib/supabase";
import ContactsTable from "@/components/ContactsTable";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState<"all" | "true" | "false">("all");

  useEffect(() => {
    async function load() {
      let query = supabase.from("contacts").select("*").order("created_at", { ascending: false });
      if (filter === "true") query = query.eq("subscribed", true);
      if (filter === "false") query = query.eq("subscribed", false);
      const { data } = await query;
      setContacts((data as Contact[]) || []);
    }
    load();
  }, [filter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "true" | "false")}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="true">Suscritos</option>
          <option value="false">No suscritos</option>
        </select>
      </div>
      <ContactsTable contacts={contacts} />
    </div>
  );
}
