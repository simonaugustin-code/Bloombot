"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; text: string };

const FAQ_CHIPS = [
  "Pre koho sú vhodné vaše produkty?",
  "Môžem kombinovať viaceré produkty?",
  "Aký je rozdiel medzi vitamínmi na vlasy vo forme gumíkov a kapsulami?",
  "Kde nájdem informácie o zložení a užívaní?",
  "Aké spôsoby platby ponúkate?",
  "Kedy mám nárok na poštovné zadarmo?",
  "Ako si uplatním zľavový kód?",
  "Môžem zmeniť produkty v objednávke?",
  "Kde je môj balík?",
  "Posielate balíky opakovane?",
  "Kedy bude akcia?",
];

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(q: string) {
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    });

    // stream SSE
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let assistantText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value);
      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        const evt = JSON.parse(payload);

        if (evt.type === "delta") {
          assistantText += evt.text;
          setMessages((m) => {
            const base = m.filter((x) => x !== (m[m.length - 1] as any)?.__draft);
            const draft: any = { role: "assistant", text: assistantText, __draft: true };
            return [...base, draft];
          });
        }
        if (evt.type === "done") {
          setMessages((m) => {
            const final = m[m.length - 1];
            const fixed = { role: "assistant", text: (final as any)?.text ?? "" } as Msg;
            return [...m.slice(0, -1), fixed];
          });
        }
      }
    }

    setLoading(false);
  }

  return (
    <main
      className="min-h-dvh mx-auto max-w-[720px] px-4 pb-24"
      style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-neutral-200 py-3 mb-4">
        <div className="flex items-center gap-3">
          {/* Logo image – drop your transparent PNG/SVG into /public/logo.png */}
          <img src="/logo.png" alt="Bloom Robbins" className="h-7 w-auto" />
          <div className="text-pink-600 font-semibold">Bloom Chatbot</div>
        </div>
      </header>

      {/* FAQ chips */}
      <section className="flex flex-wrap gap-2 mb-4">
        {FAQ_CHIPS.map((label) => (
          <button
            key={label}
            onClick={() => ask(label)}
            className="text-sm rounded-full border border-pink-200 px-3 py-1 hover:bg-pink-50 active:bg-pink-100"
          >
            {label}
          </button>
        ))}
      </section>

      {/* Messages */}
      <section className="space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl px-3 py-2 bg-pink-600 text-white"
                : "mr-auto max-w-[85%] rounded-2xl px-3 py-2 bg-neutral-100"
            }
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto max-w-[85%] rounded-2xl px-3 py-2 bg-neutral-100 text-neutral-500">
            Píšem odpoveď…
          </div>
        )}
        <div ref={scrollRef} />
      </section>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="fixed inset-x-0 bottom-0 bg-white border-t border-neutral-200"
      >
        <div className="mx-auto max-w-[720px] px-4 py-3 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:ring-2 ring-pink-300"
            placeholder="Napíš otázku…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-pink-600 text-white px-4 py-2 disabled:opacity-50"
          >
            Poslať
          </button>
        </div>
      </form>

      {/* Footer help */}
      <div className="text-xs text-neutral-500 mt-6 mb-28">
        Ak nedostaneš odpoveď, kontaktuj podporu:{" "}
        <a className="underline" href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@bloomrobbins.sk"}`}>
          {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@bloomrobbins.sk"}
        </a>{" "}
        · {process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+421 908 740 020"} (Po–Pia 8:00–16:00)
      </div>
    </main>
  );
}
