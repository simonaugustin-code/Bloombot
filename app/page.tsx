"use client";

import { useState } from "react";

const FAQ_SK = [
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

const FAQ_CS = [
  "Pro koho jsou vhodné vaše produkty?",
  "Mohu kombinovat více produktů?",
  "Jaký je rozdíl mezi vitamíny na vlasy ve formě gumídků a kapslí?",
  "Kde najdu informace o složení a užívání?",
  "Jaké způsoby platby nabízíte?",
  "Kdy mám nárok na poštovné zdarma?",
  "Jak si uplatním slevový kód?",
  "Mohu změnit produkty v objednávce?",
  "Kde je můj balíček?",
  "Posíláte balíčky opakovaně?",
  "Kdy bude akce?",
];

export default function Page() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<"sk" | "cs">("sk");

  const faqList = lang === "cs" ? FAQ_CS : FAQ_SK;

  async function sendMessage(message: string) {
    if (!message) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    const res = await fetch(`/api/ask?lang=${lang}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.body) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "⚠️ Žiadna odpoveď zo servera." },
      ]);
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((l) => l.startsWith("data:"));
      for (const line of lines) {
        const json = line.replace("data: ", "");
        try {
          const obj = JSON.parse(json);
          if (obj.text) {
            fullText += obj.text;
            setMessages((m) => [
              ...m.filter((msg) => msg !== m[m.length - 1]),
              { role: "assistant", text: fullText },
            ]);
          }
        } catch {}
      }
    }

    setLoading(false);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Bloom Chatbot</h1>

      {/* Lang toggle */}
      <div className="mb-4">
        <button
          className={`px-3 py-1 rounded-l ${
            lang === "sk" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setLang("sk")}
        >
          Slovensky
        </button>
        <button
          className={`px-3 py-1 rounded-r ${
            lang === "cs" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setLang("cs")}
        >
          Česky
        </button>
      </div>

      {/* FAQ buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {faqList.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 text-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="space-y-2 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              m.role === "user" ? "bg-gray-200 text-right" : "bg-green-100"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="italic text-gray-500">...</div>}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 border px-3 py-2 rounded"
          placeholder="Napíš otázku..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Poslať
        </button>
      </form>

      {/* Support */}
      <p className="text-sm text-gray-600 mt-6">
        Ak nedostaneš odpoveď, kontaktuj podporu:{" "}
        <a href="mailto:hello@bloomrobbins.sk" className="underline">
          hello@bloomrobbins.sk
        </a>{" "}
        •{" "}
        <a href="tel:+421908740020" className="underline">
          +421 908 740 020
        </a>{" "}
        (Po–Pia 8:00–16:00)
      </p>
    </main>
  );
}
