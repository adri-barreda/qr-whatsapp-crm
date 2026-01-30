import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const subscribed = req.nextUrl.searchParams.get("subscribed");

  let query = supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (subscribed === "true") {
    query = query.eq("subscribed", true);
  } else if (subscribed === "false") {
    query = query.eq("subscribed", false);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
