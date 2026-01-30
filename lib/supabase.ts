import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string];
  },
});

export type Contact = {
  id: string;
  phone: string;
  name: string | null;
  subscribed: boolean;
  created_at: string;
  last_message_at: string;
};

export type Campaign = {
  id: string;
  title: string;
  message: string;
  media_url: string | null;
  sent_at: string | null;
  recipient_count: number;
};

export type MessageLog = {
  id: string;
  contact_id: string;
  campaign_id: string | null;
  direction: "in" | "out";
  content: string;
  created_at: string;
};
