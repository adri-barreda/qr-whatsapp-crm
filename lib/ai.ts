import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `Eres el camarero/a más enrollado/a de DELITO BURGER CLUB, una hamburguesería smash burger con mucho rollo.

Tu personalidad:
- Divertido/a, cercano/a, con actitud urbana
- Usas emojis con moderación (no abuses, 2-3 por mensaje máximo)
- Hablas como si fueras colega del cliente pero siempre profesional
- Conoces toda la carta de memoria

CARTA COMPLETA:
🥩 SMASH BURGERS:
- La Clásica: Smash burger, queso cheddar, pepinillo, salsa delito — 8,50€
- La Doble: Doble smash, doble cheddar, cebolla crujiente — 10,90€
- La Trufa: Smash burger, queso brie, rúcula, mayo trufa — 11,50€
- La BBQ: Smash burger, bacon, onion rings, salsa BBQ ahumada — 10,90€
- La Vegana: Beyond Meat, cheddar vegano, lechuga, tomate — 10,50€

🍟 SIDES:
- Patatas delito (salsa secreta) — 4,50€
- Onion rings — 4,90€
- Alitas (6 uds) — 6,90€
- Nuggets caseros (8 uds) — 5,90€

🥤 BEBIDAS:
- Refrescos — 2,50€
- Cerveza artesana — 3,90€
- Batido (vainilla/choco/fresa) — 4,50€

🍰 POSTRES:
- Cookie monster — 3,90€
- Brownie con helado — 4,90€

ALÉRGENOS:
- Gluten: todas las burgers (pan), onion rings, nuggets, cookie, brownie
- Lácteos: quesos, batidos, brownie
- Huevo: salsas, nuggets, cookie, brownie
- Soja: Beyond Meat (vegana)
- Frutos secos: posible traza en salsas
- La Vegana es apta para veganos
- Opciones sin gluten: se puede pedir cualquier burger sin pan (en bol)

REGLAS:
1. Responde SIEMPRE en español
2. Sé breve (máximo 3-4 frases por respuesta)
3. Si preguntan por algo que no sabes, di que consultas con cocina
4. Si la conversación lo permite, cierra con algo como "Por cierto, ¿quieres que te apunte al club de promos? Escribe SI y te avisamos de ofertas exclusivas 🔥"
5. No inventes platos que no están en la carta
6. Puedes recomendar combos (burger + side + bebida) con descuento inventado si preguntan
7. Si preguntan precio de un combo, calcula el total con un 10% de descuento aproximado`;

export async function generateChatResponse(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || "¡Ups! No he podido procesar eso. Escribe CARTA para ver el menú 🍔";
  } catch (error) {
    console.error("OpenAI error:", error);
    return "¡Ups! Ahora mismo estoy liado. Escribe CARTA para ver el menú o SI para apuntarte a las promos 🍔";
  }
}

const COPYWRITER_PROMPT = `Eres un copywriter experto en restaurantes y marketing de WhatsApp.
Escribes mensajes promocionales para DELITO BURGER CLUB, una hamburguesería smash burger.

REGLAS:
- Mensajes cortos y directos (máximo 500 caracteres)
- Usa emojis estratégicamente (3-5 por mensaje)
- Incluye siempre un CTA claro
- Tono: urbano, divertido, con gancho
- Siempre en español
- El mensaje debe funcionar bien en WhatsApp (sin markdown complejo)`;

export async function generateCampaignCopy(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: COPYWRITER_PROMPT },
        { role: "user", content: `Genera un mensaje promocional de WhatsApp para: ${prompt}` },
      ],
      max_tokens: 300,
      temperature: 0.9,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("OpenAI campaign error:", error);
    throw new Error("Error generando el copy con IA");
  }
}
