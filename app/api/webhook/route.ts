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

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Recibir mensajes (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook POST received:", JSON.stringify(body).slice(0, 500));

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // WhatsApp envía también status updates, no solo mensajes
    if (!value?.messages?.[0]) {
      console.log("No message in payload, likely a status update");
      return NextResponse.json({ status: "no message" });
    }

    const msg = value.messages[0];
    const contact = value.contacts?.[0];
    const phone = msg.from;
    const name = contact?.profile?.name || null;
    const text = msg.text?.body || "";

    console.log(`Message from ${phone} (${name}): ${text}`);

    // Upsert del contacto
    const { data: existingContact, error: fetchError } = await supabase
      .from("contacts")
      .select("id, subscribed")
      .eq("phone", phone)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching contact:", fetchError);
    }

    let contactId: string;

    if (existingContact) {
      contactId = existingContact.id;
      await supabase
        .from("contacts")
        .update({ name, last_message_at: new Date().toISOString() })
        .eq("id", contactId);
    } else {
      const { data: newContact, error: insertError } = await supabase
        .from("contacts")
        .insert({ phone, name })
        .select("id")
        .single();

      if (insertError || !newContact) {
        console.error("Error inserting contact:", insertError);
        return NextResponse.json({ status: "error", error: insertError?.message });
      }
      contactId = newContact.id;
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
      console.log(`New contact ${phone}, sending welcome message`);
      try {
        await sendTextMessage(
          phone,
          "Hola! Gracias por contactarnos.\n\nAqui tienes nuestra carta/menu:\nhttps://tu-negocio.com/menu\n\nTe gustaria recibir promociones exclusivas? Responde *SI* para suscribirte."
        );
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: "Mensaje de bienvenida + carta enviada",
        });
        console.log(`Welcome message sent to ${phone}`);
      } catch (err) {
        console.error(`Error sending welcome to ${phone}:`, err);
      }
    } else if (lowerText === "si" || lowerText === "sí" || lowerText === "suscribir" || lowerText === "suscribirme") {
      await supabase
        .from("contacts")
        .update({ subscribed: true })
        .eq("id", contactId);
      try {
        await sendTextMessage(
          phone,
          "Genial! Ya estas suscrito a nuestras promociones. Te avisaremos cuando tengamos ofertas especiales."
        );
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: "Confirmación de suscripción",
        });
      } catch (err) {
        console.error(`Error sending subscription confirmation to ${phone}:`, err);
      }
    } else if (lowerText === "no" || lowerText === "baja" || lowerText === "cancelar") {
      await supabase
        .from("contacts")
        .update({ subscribed: false })
        .eq("id", contactId);
      try {
        await sendTextMessage(
          phone,
          "Entendido. Si cambias de opinion, escribenos *SI* en cualquier momento."
        );
      } catch (err) {
        console.error(`Error sending unsubscribe msg to ${phone}:`, err);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook POST error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
