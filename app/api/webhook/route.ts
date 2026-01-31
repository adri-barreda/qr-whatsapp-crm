import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendTextMessage, sendButtonMessage, sendImageMessage, sendDocumentMessage } from "@/lib/whatsapp";
import { generateChatResponse } from "@/lib/ai";

export const dynamic = "force-dynamic";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "qr-crm-verify";

const SUBSCRIBE_MSG = `🎉 *¡ESTÁS DENTRO!*

Ya formas parte del club. Vas a recibir:
• 🔥 Promos exclusivas solo para ti
• 🎁 Sorpresas el día de tu cumpe
• 🍔 Novedades de la carta antes que nadie

Esto va a ser un DELITO. 😈`;

const UNSUBSCRIBE_MSG = `👋 Sin problema, no recibirás más promos.

Si cambias de opinión, escríbenos cuando quieras. ¡Aquí estaremos!`;

async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from("settings").select("key, value");
  const map: Record<string, string> = {};
  if (data) for (const row of data) map[row.key] = row.value;
  return map;
}

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

// Extraer texto del mensaje (soporta texto normal y botones interactivos)
function extractMessageText(msg: Record<string, unknown>): { text: string; buttonId: string | null } {
  // Respuesta de botón interactivo
  if (msg.type === "interactive") {
    const interactive = msg.interactive as Record<string, unknown>;
    if (interactive?.type === "button_reply") {
      const reply = interactive.button_reply as { id: string; title: string };
      return { text: reply.title, buttonId: reply.id };
    }
  }
  // Mensaje de texto normal
  const textObj = msg.text as { body?: string } | undefined;
  return { text: textObj?.body || "", buttonId: null };
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
    const { text, buttonId } = extractMessageText(msg);

    console.log(`Message from ${phone} (${name}): ${text} [buttonId: ${buttonId}]`);

    // Fetch editable settings from DB
    const settings = await getSettings();
    const burgerMesTexto = settings["burger_mes_texto"] || "🏆 *BURGER DEL MES* 🏆\n\n🔥 Pregunta en barra 🔥";
    const burgerMesImagen = settings["burger_mes_imagen"] || "https://qr-whatsapp-crm.vercel.app/burger-mes.png";
    const cartaUrl = settings["carta_url"] || "https://qr-whatsapp-crm.vercel.app/carta.pdf";
    const recomendacionesTexto = settings["recomendaciones"] || "";
    const ofertasTexto = settings["ofertas"] || `🔥 *OFERTAS ACTIVAS* 🔥\n\n• 2x1 en Smash Burgers los martes\n• Combo Clásica + Patatas + Refresco por 12,90€\n• Trae a un amigo y tu postre gratis\n\n¡Aprovecha antes de que se acaben! 😈`;

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

    // --- Flujo con botones interactivos ---
    const lowerText = text.toLowerCase().trim();

    try {
      // 1. Primer mensaje → Bienvenida con botones
      if (isNew) {
        await sendButtonMessage(
          phone,
          "¡Bienvenido/a! Nos alegra que estés aquí. ¿Qué te apetece?",
          [
            { id: "btn_carta", title: "Ver carta 🍔" },
            { id: "btn_burger_mes", title: "Burger del mes 🏆" },
            { id: "btn_recomendaciones", title: "Recomendaciones 👨‍🍳" },
          ],
          "🍔 DELITO BURGER CLUB",
          "Escríbenos lo que quieras, ¡estamos aquí!"
        );
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: "[Bienvenida con botones]",
        });
      }

      // 2. Botón "Ver carta" o texto carta/menu
      else if (buttonId === "btn_carta" || lowerText === "carta" || lowerText === "menu" || lowerText === "menú" || lowerText.includes("ver la carta") || lowerText.includes("quiero ver")) {
        await sendDocumentMessage(
          phone,
          cartaUrl,
          "Carta Delito Burger.pdf",
          "🔥 Aquí tienes nuestra carta completa. ¡Elige tu delito!"
        );
        await sendButtonMessage(
          phone,
          "¿Algo más?",
          [
            { id: "btn_burger_mes", title: "Burger del mes 🏆" },
            { id: "btn_ofertas", title: "Ver ofertas 🔥" },
            { id: "btn_recomendaciones", title: "Recomendaciones 👨‍🍳" },
          ],
        );
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: "[Carta PDF enviada]",
        });
      }

      // 3. Botón "Burger del mes"
      else if (buttonId === "btn_burger_mes") {
        await sendImageMessage(
          phone,
          burgerMesImagen,
          burgerMesTexto
        );
        await sendButtonMessage(
          phone,
          "¿Te apuntas al club para enterarte de estas cosas antes que nadie?",
          [
            { id: "btn_ofertas", title: "Ver ofertas 🔥" },
            { id: "btn_recomendaciones", title: "Recomendaciones 👨‍🍳" },
          ],
        );
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: burgerMesTexto.slice(0, 500),
        });
      }

      // 4. Botón "Ver ofertas" → Requiere suscripción
      else if (buttonId === "btn_ofertas") {
        if (existingContact?.subscribed) {
          // Ya suscrito, mostrar ofertas
          await sendTextMessage(phone, ofertasTexto);
          await supabase.from("messages_log").insert({
            contact_id: contactId,
            direction: "out",
            content: "[Ofertas activas]",
          });
        } else {
          // No suscrito → pedir suscripción con botones
          await sendButtonMessage(
            phone,
            "Para ver las ofertas exclusivas, necesitas unirte al club. ¡Es gratis y solo recibirás cosas buenas!",
            [
              { id: "btn_suscribir", title: "¡Me apunto! 🎉" },
              { id: "btn_no_gracias", title: "No, gracias" },
            ],
            "🔒 OFERTAS EXCLUSIVAS",
            "Cero spam, solo promos que molan."
          );
          await supabase.from("messages_log").insert({
            contact_id: contactId,
            direction: "out",
            content: "[Solicitud suscripción para ver ofertas]",
          });
        }
      }

      // 5. Botón "Me apunto" → Suscribir
      else if (buttonId === "btn_suscribir" || lowerText === "si" || lowerText === "sí" || lowerText === "si!" || lowerText === "sí!" || lowerText === "quiero" || lowerText === "suscribir" || lowerText === "suscribirme") {
        await supabase
          .from("contacts")
          .update({ subscribed: true })
          .eq("id", contactId);
        await sendTextMessage(phone, SUBSCRIBE_MSG);
        // Ahora que está suscrito, mostrar ofertas automáticamente
        await sendTextMessage(phone, ofertasTexto);
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: SUBSCRIBE_MSG.slice(0, 500),
        });
      }

      // 6. Botón "No gracias" o baja
      else if (buttonId === "btn_no_gracias" || lowerText === "no" || lowerText === "baja" || lowerText === "cancelar" || lowerText === "no quiero") {
        await supabase
          .from("contacts")
          .update({ subscribed: false })
          .eq("id", contactId);
        await sendTextMessage(phone, UNSUBSCRIBE_MSG);
        await sendButtonMessage(
          phone,
          "¿Puedo ayudarte con algo más?",
          [
            { id: "btn_carta", title: "Ver carta 🍔" },
            { id: "btn_burger_mes", title: "Burger del mes 🏆" },
          ],
        );
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: UNSUBSCRIBE_MSG,
        });
      }

      // 7. Botón "Recomendaciones"
      else if (buttonId === "btn_recomendaciones") {
        const msg = recomendacionesTexto || "🍔 Pregunta a nuestro equipo, ¡te ayudamos a elegir!";
        await sendTextMessage(phone, msg);
        await sendButtonMessage(
          phone,
          "¿Algo más?",
          [
            { id: "btn_carta", title: "Ver carta 🍔" },
            { id: "btn_burger_mes", title: "Burger del mes 🏆" },
            { id: "btn_ofertas", title: "Ver ofertas 🔥" },
          ],
        );
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: "[Recomendaciones]",
        });
      }

      // 8. Cualquier otro mensaje → IA responde como camarero
      else {
        const aiReply = await generateChatResponse(text);
        await sendTextMessage(phone, aiReply);
        await supabase.from("messages_log").insert({
          contact_id: contactId,
          direction: "out",
          content: aiReply.slice(0, 500),
        });
      }

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
