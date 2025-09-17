// app/api/ask/route.ts
import { NextRequest } from "next/server";

const ORIGIN = "https://bloomdevelop.myshopify.com";
const CORS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { messages = [] } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 500, headers: CORS });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: messages.map((m: any) => ({ role: m.role, content: m.text })),
      }),
    });
    const data = await r.json();
    const answer =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Ospravedlňujem sa, teraz nemám istú odpoveď.";

    return Response.json({ answer }, { status: 200, headers: CORS });
  } catch (e) {
    return Response.json({ answer: "" }, { status: 200, headers: CORS });
  }
}
