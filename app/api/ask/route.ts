import type { NextRequest } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "hello@bloomrobbins.sk";
const SUPPORT_PHONE = process.env.SUPPORT_PHONE || "+421 908 740 020";

// --- Your FAQ (SK) ---
const FAQ: { q: string; a: string; keys: string[] }[] = [
  {
    q: "Pre koho sú vhodné vaše produkty?",
    a:
      "Naše produkty sú vhodné pre ženy, mužov a deti od 12 rokov. " +
      "Pre deti od 4 rokov máme vitamíny na podporu imunity. Pre tehotné a dojčiace sú určené " +
      "vitamíny na vlasy pre mamičky a vitamíny na imunitu a trávenie s probiotikami.",
    keys: ["vhodné", "pre koho", "deti", "tehotné", "dojčiace", "mamičky", "imunita"],
  },
  {
    q: "Môžem kombinovať viaceré produkty?",
    a:
      "Áno, ale sledujte odporúčanú dennú dávku jednotlivých zložiek. " +
      "Ak užívate lieky alebo máte zdravotné ťažkosti, poraďte sa s vaším lekárom.",
    keys: ["kombinovať", "spolu", "viaceré", "dávkovanie", "lieky"],
  },
  {
    q: "Aký je rozdiel medzi vitamínmi na vlasy vo forme gumíkov a kapsulami?",
    a:
      "Kapsuly sú vhodné pri väčšom probléme s vlasmi – obsahujú o ~10 aktívnych zložiek viac. " +
      "Morský kolagén zlepšuje kvalitu vlasov a znižuje lámanie. " +
      "Gumíky sú hravá forma pre tých, ktorí neradi prehĺtajú tablety; " +
      "inositol + cholín pomáhajú pri nadmernom vypadávaní a podpore rastu.",
    keys: ["rozdiel", "gumíky", "kapsule", "vlasy", "kolagén", "inositol", "cholín"],
  },
  {
    q: "Kde nájdem informácie o zložení a užívaní?",
    a:
      "Na stránke produktu nájdete sekcie zloženie a užívanie. Rovnaké informácie sú aj na etikete " +
      "priamo na produkte (po odlepení nájdete viac jazykov vrátane slovenčiny).",
    keys: ["zloženie", "užívanie", "etiketa", "web", "produkt"],
  },
  {
    q: "Aké spôsoby platby ponúkate?",
    a: "Platba kartou vopred alebo dobierka.",
    keys: ["platba", "spôsoby", "dobierka", "karta"],
  },
  {
    q: "Kedy mám nárok na poštovné zadarmo?",
    a:
      "Pri nákupe nad 60 €. Ide o časovo obmedzenú akciu a nekombinuje sa s väčšími akciami. " +
      "Ak zľavový kód zníži objednávku pod 60 €, poštovné sa účtuje štandardne.",
    keys: ["poštovné", "zadarmo", "doprava", "60"],
  },
  {
    q: "Ako si uplatním zľavový kód?",
    a:
      "V košíku vpíšte kód a potvrďte. Musí byť skopírovaný v plnom znení. " +
      "Zľavy a akcie sa nekombinujú — uplatní sa výhodnejšia.",
    keys: ["zľavový kód", "nefunguje", "košík"],
  },
  {
    q: "Môžem zmeniť produkty v objednávke?",
    a:
      "Potvrdenú objednávku nemožno upravovať. Ak ešte nebola odoslaná, vieme ju stornovať a môžete vytvoriť novú.",
    keys: ["zmeniť", "objednávka", "storno", "upravovať"],
  },
  {
    q: "Kde je môj balík?",
    a:
      "Po odoslaní dostanete e-mail s tracking číslom, kde viete sledovať balík. " +
      "Po odovzdaní prepravcovi kontaktujte prepravcu pre detailné info.",
    keys: ["kde je balík", "tracking", "sledovanie", "zásielka"],
  },
  {
    q: "Posielate balíky opakovane?",
    a: "Preposielanie neprevzatých balíkov neposkytujeme. Vytvorte novú objednávku.",
    keys: ["preposielanie", "neprevzaté"],
  },
  {
    q: "Kedy bude akcia?",
    a: "Sledujte naše sociálne siete; ak niečo beží, uvidíte to na webe/IG.",
    keys: ["akcia", "zľava", "sale"],
  },
];

// simple keyword score (fast & robust)
function score(question: string, keys: string[]) {
  const q = question.toLowerCase();
  return keys.reduce((s, k) => (q.includes(k) ? s + 1 : s), 0);
}

function findFaqAnswer(question: string) {
  let best = { i: -1, s: 0 };
  FAQ.forEach((item, i) => {
    const s = Math.max(score(question, item.keys), score(question, item.q.toLowerCase().split(/\W+/)));
    if (s > best.s) best = { i, s };
  });
  if (best.s >= 2) return FAQ[best.i]!.a; // require at least 2 hits to be confident
  return null;
}

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: any) => controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));

      try {
        // 1) FAQ first
        const faq = findFaqAnswer(question || "");
        if (faq) {
          // stream the FAQ text for nice typing feel
          for (const part of faq.match(/.{1,140}/g) || []) {
            send({ type: "delta", text: part });
            await new Promise((r) => setTimeout(r, 20));
          }
          send({ type: "done" });
          controller.close();
          return;
        }

        // 2) AI fallback (OpenAI)
        const sys =
          "Si zákaznícka podpora Bloom Robbins (SK/CZ). Odpovedaj stručne, priateľsky a presne. " +
          "Ak je otázka priamo pokrytá FAQ (uvedené nižšie), použi tieto informácie. " +
          "Ak odpoveď nevieš, povedz to a odporuč podporu.\n\n" +
          "FAQ (stručné body):\n" +
          FAQ.map((f) => `• ${f.q}\n  ${f.a}`).join("\n") +
          `\n\nKontakty: ${SUPPORT_EMAIL}, ${SUPPORT_PHONE} (Po–Pia 8:00–16:00).`;

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            stream: true,
            messages: [
              { role: "system", content: sys },
              { role: "user", content: String(question || "") },
            ],
          }),
        });

        if (!openaiRes.ok || !openaiRes.body) {
          throw new Error(`OpenAI HTTP ${openaiRes.status}`);
        }

        const reader = openaiRes.body.getReader();
        const dec = new TextDecoder();

        // parse OpenAI text-stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value);
          for (const line of chunk.split("\n")) {
            const m = line.match(/^data:\s*(\{.*\})\s*$/);
            if (!m) continue;
            const obj = JSON.parse(m[1]);
            const delta = obj?.choices?.[0]?.delta?.content;
            if (delta) send({ type: "delta", text: delta });
          }
        }

        send({ type: "done" });
        controller.close();
      } catch (err) {
        const fallback =
          `Prepáč, teraz neviem odpovedať. Skús to neskôr alebo napíš na ${SUPPORT_EMAIL}, ` +
          `prípadne volaj ${SUPPORT_PHONE} (Po–Pia 8:00–16:00).`;
        send({ type: "delta", text: fallback });
        send({ type: "done" });
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
