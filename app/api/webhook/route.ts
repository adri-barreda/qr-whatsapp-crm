import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendTextMessage } from "@/lib/whatsapp";
import { generateChatResponse } from "@/lib/ai";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "qr-crm-verify";

const WELCOME_MSG = `🍔 *DELITO BURGUER CLUB* 🍔

¡Bienvenido/a! Nos alegra que estés aquí.

🔥 *NUESTRA CARTA* 🔥

🥩 *SMASH BURGERS*
• La Clásica — Smash burger, queso cheddar, pepinillo, salsa delito — 8,50€
• La Doble — Doble smash, doble cheddar, cebolla crujiente — 10,90€
• La Trufa — Smash burger, queso brie, rúcula, mayo trufa — 11,50€
• La BBQ — Smash burger, bacon, onion rings, salsa BBQ ahumada — 10,90€
• La Vegana — Beyond Meat, cheddar vegano, lechuga, tomate — 10,50€

🍟 *SIDES*
• Patatas delito (salsa secreta) — 4,50€
• Onion rings — 4,90€
• Alitas (6 uds) — 6,90€
• Nuggets caseros (8 uds) — 5,90€

🥤 *BEBIDAS*
• Refrescos — 2,50€
• Cerveza artesana — 3,90€
• Batido (vainilla/choco/fresa) — 4,50€

🍰 *POSTRES*
• Cookie monster — 3,90€
• Brownie con helado — 4,90€

📍 Pide en barra o desde aquí mismo.

---

💥 *¿Quieres recibir PROMOS EXCLUSIVAS y enterarte antes que nadie de nuestras ofertas?*

Responde *SI* y te avisamos. Solo cosas buenas, cero spam.`;

const SUBSCRIBE_MSG = `🎉 *¡ESTÁS DENTRO!*

Ya formas parte del club. Vas a recibir:
• 🔥 Promos exclusivas solo para ti
• 🎁 Sorpresas el día de tu cumple
• 🍔 Novedades de la carta antes que nadie

Esto va a ser un DELITO. 😈`;

const UNSUBSCRIBE_MSG = `👋 Sin problema, no recibirás más promos.

Si cambias de opinión, escríbenos *SI* cuando quieras. ¡Aquí estaremos!`;

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

    if (!value?.messages?.[0]) {
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
    const isNew = !existingContact;

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
        return NextResponse.json({ status: "error" });
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

    let replyMsg = "";

    if (isNew) {
      replyMsg = WELCOME_MSG;
    } else if (lowerText === "si" || lowerText === "sí" || lowerText === "si!" || lowerText === "sí!" || lowerText === "quiero" || lowerText === "suscribir" || lowerText === "suscribirme") {
      await supabase
        .from("contacts")
        .update({ subscribed: true })
        .eq("id", contactId);
      replyMsg = SUBSCRIBE_MSG;
    } else if (lowerText === "no" || lowerText === "baja" || lowerText === "cancelar" || lowerText === "no quiero") {
      await supabase
        .from("contacts")
        .update({ subscribed: false })
        .eq("id", contactId);
      replyMsg = UNSUBSCRIBE_MSG;
    } else if (lowerText === "carta" || lowerText === "menu" || lowerText === "menú" || lowerText.includes("ver la carta") || lowerText.includes("quiero ver")) {
      replyMsg = WELCOME_MSG;
    } else {
      // IA responde como camarero
      replyMsg = await generateChatResponse(text);
    }

    try {
      await sendTextMessage(phone, replyMsg);
      await supabase.from("messages_log").insert({
        contact_id: contactId,
        direction: "out",
        content: replyMsg.slice(0, 500),
      });
      console.log(`Reply sent to ${phone}`);
    } catch (err) {
      console.error(`Error sending reply to ${phone}:`, err);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook POST error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
