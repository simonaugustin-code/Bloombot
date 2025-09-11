import { NextRequest } from "next/server";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Pre koho sú vhodné vaše produkty",
    a: "Naše produkty sú vhodné pre ženy, mužov a deti od 12 rokov. Pre deti od 4 rokov máme vitamíny na imunitu. Pre tehotné a dojčiace mamičky: vitamíny na vlasy pre mamičky + vitamíny na imunitu a trávenie (s probiotikami).",
  },
  {
    q: "Môžem kombinovať viaceré produkty",
    a: "Áno, ale sledujte dennú odporúčanú dávku každej zložky. Pri ochoreniach alebo liekoch konzultujte s lekárom.",
  },
  {
    q: "Aký je rozdiel medzi vitamínmi na vlasy vo forme gumíkov a kapsulami",
    a: "Kapsule: viac aktívnych látok (+10), morský kolagén, lepšia kvalita vlasov, menej lámania. Gumíky: hravejšie užívanie, vhodné ak máte problém s prehĺtaním; inozitol + cholín znižujú padanie a podporujú rast.",
  },
  {
    q: "Kde nájdem informácie o zložení a užívaní",
    a: "Na stránke produktu (ingrediencie a užívanie) aj na etikete balenia (po odlepení, viac jazykov vrátane slovenčiny).",
  },
  {
    q: "Aké spôsoby platby ponúkate",
    a: "Platba kartou vopred alebo dobierka.",
  },
  {
    q: "Kedy mám nárok na poštovné zadarmo",
    a: "Pri nákupe nad 60 €. Akcia je časovo obmedzená a nekombinuje sa s väčšími akciami. Ak zľava zníži košík pod 60 €, poštovné je spoplatnené.",
  },
  {
    q: "Ako si uplatním zľavový kód",
    a: "V košíku vpíšte kód a potvrďte. Musí byť skopírovaný celý. Zľavy sa nekombinujú – uplatní sa výhodnejšia.",
  },
  {
    q: "Môžem zmeniť produkty v objednávke",
    a: "Potvrdenú objednávku neupravujeme. Ak ešte neodišla, stornujeme a môžete spraviť novú.",
  },
  {
    q: "Kde je môj balík",
    a: "Po odoslaní dostanete tracking e-mail. Pre stav balíka po odoslaní kontaktujte dopravcu.",
  },
  {
    q: "Posielate balíky opakovane",
    a: "Neprevzaté balíky nepreposielame. Vytvorte novú objednávku.",
  },
  {
    q: "Kedy bude akcia",
    a: "Sledujte naše sociálne siete. Ak treba pomoc: hello@bloomrobbins.sk, +421 908 740 020 (Po–Pia 8:00–16:00).",
  },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g, "").trim();
}

function findFaqAnswer(userQ: string) {
  const qn = normalize(userQ);
  let best = { score: 0, a: "" };
  for (const { q, a } of FAQ) {
    const parts = normalize(q).split(/\s+/);
    let hit = 0;
    for (const p of parts) if (qn.includes(p)) hit++;
    const score = hit / Math.max(3, parts.length); // simple fuzzy
    if (score > best.score) best = { score, a };
  }
  return best.score >= 0.45 ? best.a : null;
}

export async function POST(req: NextRequest) {
  const { message, locale } = await req.json().catch(() => ({ message: "", locale: "sk" }));
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1) try FAQ
      const faq = findFaqAnswer(message || "");
      if (faq) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: faq })}\n\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
        return;
      }

      // 2) AI fallback (OpenAI responses in SK/CZ)
      try {
        const apiKey = process.env.OPENAI_API_KEY!;
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            stream: true,
            messages: [
              {
                role: "system",
                content:
                  "Si zákaznícky asistent pre e-shop Bloom Robbins. Odpovedaj stručne a po slovensky (alebo česky, ak otázka znie česky). Ak nemáš istotu, navrhni kontaktovať podporu: hello@bloomrobbins.sk, +421 908 740 020 (Po–Pia 8:00–16:00).",
              },
              { role: "user", content: message || "" },
            ],
          }),
        });

        if (!r.ok || !r.body) throw new Error("OpenAI error");

        const reader = r.body.getReader();
        const decoder = new TextDecoder();

        // relay SSE chunks (very simple)
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          // convert OpenAI SSE into our minimal stream (collect content tokens)
          for (const line of chunk.split("\n")) {
            const m = line.match(/^data:\s*(\{.*\})/);
            if (!m) continue;
            const obj = JSON.parse(m[1]);
            const delta = obj.choices?.[0]?.delta?.content;
            if (delta) {
              controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: delta })}\n\n`));
            }
          }
        }
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch (e) {
        const fallback =
          "Prepáč, teraz neviem odpovedať. Skús to neskôr alebo napíš na hello@bloomrobbins.sk, prípadne volaj +421 908 740 020 (Po–Pia 8:00–16:00).";
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ text: fallback })}\n\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
