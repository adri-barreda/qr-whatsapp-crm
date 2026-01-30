import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendTextMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "qr-crm-verify";

// Verificación del webhook (GET)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log("Webhook verify:", { mode, token, challenge, VERIFY_TOKEN });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json(
    { error: "Forbidden", debug: { mode, token, expected: VERIFY_TOKEN } },
    { status: 403 }
  );
}

// Recibir mensajes (POST)
export async function POST(req: NextRequest) {
  const body = await req.json();

  const entry = body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  if (!value?.messages?.[0]) {
    return NextResponse.json({ status: "no message" });
  }

  const msg = value.messages[0];
  const contact = value.contacts?.[0];
  const phone = msg.from;
  const name = contact?.profile?.name || null;
  const text = msg.text?.body || "";

  // Upsert del contacto
  const { data: existingContact } = await supabase
    .from("contacts")
    .select("id, subscribed")
    .eq("phone", phone)
    .single();

  let contactId: string;

  if (existingContact) {
    contactId = existingContact.id;
    await supabase
      .from("contacts")
      .update({ name, last_message_at: new Date().toISOString() })
      .eq("id", contactId);
  } else {
    const { data: newContact } = await supabase
      .from("contacts")
      .insert({ phone, name })
      .select("id")
      .single();
    contactId = newContact!.id;
  }

  // Guardar mensaje entrante
  await supabase.from("messages_log").insert({
    contact_id: contactId,
    direction: "in",
    content: text,
  });

  // Flujo automático
  const lowerText = text.toLowerCase().trim();

  if (!existingContact) {
    // Primer mensaje: enviar carta/menú y preguntar por promos
    await sendTextMessage(
      phone,
      "¡Hola! 👋 Gracias por contactarnos.\n\nAquí tienes nuestra carta/menú:\nhttps://tu-negocio.com/menu\n\n¿Te gustaría recibir promociones exclusivas? Responde *SI* para suscribirte."
    );
    await supabase.from("messages_log").insert({
      contact_id: contactId,
      direction: "out",
      content: "Mensaje de bienvenida + carta enviada",
    });
  } else if (lowerText === "si" || lowerText === "sí") {
    await supabase
      .from("contacts")
      .update({ subscribed: true })
      .eq("id", contactId);
    await sendTextMessage(
      phone,
      "¡Genial! 🎉 Ya estás suscrito a nuestras promociones. Te avisaremos cuando tengamos ofertas especiales."
    );
    await supabase.from("messages_log").insert({
      contact_id: contactId,
      direction: "out",
      content: "Confirmación de suscripción",
    });
  } else if (lowerText === "no") {
    await supabase
      .from("contacts")
      .update({ subscribed: false })
      .eq("id", contactId);
    await sendTextMessage(
      phone,
      "Entendido. Si cambias de opinión, escríbenos *SI* en cualquier momento."
    );
  }

  return NextResponse.json({ status: "ok" });
}
