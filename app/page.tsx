"use client";
import { useEffect, useRef, useState } from "react";

const QUICK = [
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
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  async function ask(message: string) {
    setMsgs((m) => [...m, { role: "user", text: message }]);

    // streaming
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok || !res.body) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "Prepáč, služba je dočasne nedostupná. Napíš na hello@bloomrobbins.sk alebo volaj +421 908 740 020.",
        },
      ]);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    setMsgs((m) => [...m, { role: "assistant", text: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        const m = line.match(/^data:\s*(\{.*\})/);
        if (!m) continue;
        const { text, done: finished } = JSON.parse(m[1]);
        if (text) {
          acc += text;
          setMsgs((msgs) => {
            const copy = [...msgs];
            copy[copy.length - 1] = { role: "assistant", text: acc };
            return copy;
          });
        }
        if (finished) break;
      }
    }
  }

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Bloom Chatbot</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-full px-3 py-1 text-sm bg-neutral-800 hover:bg-neutral-700 border border-neutral-700"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="max-w-3xl space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "self-end bg-blue-600/20 border border-blue-700 rounded-2xl px-3 py-2 w-fit"
                : "bg-neutral-800 border border-neutral-700 rounded-2xl px-3 py-2 w-fit"
            }
          >
            {m.text}
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.trim();
          if (!v) return;
          setInput("");
          ask(v);
        }}
        className="max-w-3xl mt-6 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Napíš otázku…"
          className="flex-1 rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 outline-none"
        />
        <button className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2">
          Poslať
        </button>
      </form>

      <p className="text-xs text-neutral-400 mt-6">
        Ak nedostaneš odpoveď, kontaktuj podporu:{" "}
        <a className="underline" href="mailto:hello@bloomrobbins.sk">
          hello@bloomrobbins.sk
        </a>{" "}
        • +421 908 740 020 (Po–Pia 8:00–16:00)
      </p>
    </main>
  );
}
