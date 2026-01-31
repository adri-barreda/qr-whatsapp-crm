import { NextRequest, NextResponse } from "next/server";
import { generateCampaignCopy } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Se necesita un prompt" }, { status: 400 });
    }

    const text = await generateCampaignCopy(prompt);
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Error generando el texto" }, { status: 500 });
  }
}
