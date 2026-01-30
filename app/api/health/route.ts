import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING";
  checks.SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "MISSING";
  checks.WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN ? `set (${process.env.WHATSAPP_TOKEN.length} chars)` : "MISSING";
  checks.WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "MISSING";
  checks.WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "MISSING";

  // Check Supabase connection
  try {
    const { count, error } = await supabase
      .from("contacts")
      .select("id", { count: "exact", head: true });
    checks.SUPABASE_CONNECTION = error ? `error: ${error.message}` : `ok (${count} contacts)`;
  } catch (e) {
    checks.SUPABASE_CONNECTION = `error: ${e}`;
  }

  return NextResponse.json(checks);
}
