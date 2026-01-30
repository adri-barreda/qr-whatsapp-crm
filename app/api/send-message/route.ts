import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  sendTextMessage,
  sendImageMessage,
  sendTemplateMessage,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { title, message, media_url, template_name, template_lang } =
    await req.json();

  if (!message && !template_name) {
    return NextResponse.json(
      { error: "Se necesita un mensaje o una plantilla" },
      { status: 400 }
    );
  }

  // Obtener contactos suscritos
  const { data: subscribers } = await supabase
    .from("contacts")
    .select("id, phone")
    .eq("subscribed", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json(
      { error: "No hay suscriptores" },
      { status: 400 }
    );
  }

  // Crear campaña
  const { data: campaign } = await supabase
    .from("campaigns")
    .insert({
      title: title || template_name || "Sin título",
      message: message || `[Plantilla: ${template_name}]`,
      media_url: media_url || null,
      sent_at: new Date().toISOString(),
      recipient_count: subscribers.length,
    })
    .select("id")
    .single();

  // Enviar a cada suscriptor
  const results = await Promise.allSettled(
    subscribers.map(async (sub) => {
      if (template_name) {
        // Envío con plantilla aprobada (funciona fuera de ventana 24h)
        await sendTemplateMessage(
          sub.phone,
          template_name,
          template_lang || "es"
        );
      } else if (media_url) {
        await sendImageMessage(sub.phone, media_url, message);
      } else {
        await sendTextMessage(sub.phone, message);
      }
      await supabase.from("messages_log").insert({
        contact_id: sub.id,
        campaign_id: campaign?.id,
        direction: "out",
        content: message || `[Plantilla: ${template_name}]`,
      });
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, campaign_id: campaign?.id });
}
