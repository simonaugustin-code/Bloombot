"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant" | "system"; text: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  // ✅ keep role as a literal using `as const`
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant" as const, text: "Ahoj! Ako ti môžem pomôcť? 😊" },
  ]);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatId] = useState(() => crypto.randomUUID());
  const viewRef = useRef<HTMLDivElement>(null);

  // Allow “FAQ chip” clicks from the page to prefill + open widget
  useEffect(() => {
    const onPrefill = (e: any) => {
      setOpen(true);
      setInput(e.detail || "");
    };
    document.addEventListener("br-chat:prefill" as any, onPrefill);
    return () => document.removeEventListener("br-chat:prefill" as any, onPrefill);
  }, []);

  useEffect(() => {
    viewRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs, open]);

  const ask = async (question: string) => {
    if (!question.trim()) return;

    // ✅ ensure the array is typed as Msg[]
    const next: Msg[] = [...msgs, { role: "user" as const, text: question }];
    setMsgs(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch(`/api/ask/stream?chatId=${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) throw new Error("stream-failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let assistant = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // parse SSE lines that start with "data: "
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep partial line in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (!json || json === "[DONE]") continue;

          try {
            const obj = JSON.parse(json);

            if (obj.delta) {
              assistant += obj.delta;

              // ✅ update/append the single assistant bubble while streaming
              setMsgs((prev) => {
                const copy = [...prev];
                const last = copy[copy.length - 1];
                if (last && last.role === "assistant") {
                  copy[copy.length - 1] = { role: "assistant", text: assistant } as const;
                } else {
                  copy.push({ role: "assistant", text: assistant } as const);
                }
                return copy as Msg[];
              });
            }
          } catch {
            // ignore JSON parse errors for partial lines
          }
        }
      }
    } catch {
      setMsgs((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "Prepáč, teraz neviem odpovedať. Napíš nám na hello@bloomrobbins.sk alebo zavolaj +421 908 740 020 (Po–Pia 8:00–16:00).",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        aria-label="Open chat"
        className="br-bubble"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="br-bubble-dot" />
      </button>

      {open && (
        <div className="br-panel">
          <div className="br-panel-header">
            <div className="br-dot" />
            <span>Bloom Chatbot</span>
            <button className="br-x" onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
          </div>

          <div ref={viewRef} className="br-panel-view">
            {msgs.map((m, i) => (
              <div key={i} className={`br-msg ${m.role}`}>
                <div className="br-msg-bubble">{m.text}</div>
              </div>
            ))}
          </div>

          <form
            className="br-inputrow"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              className="br-input"
              placeholder="Napíš správu…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={busy}
            />
            <button className="br-send" disabled={busy || !input.trim()}>
              Poslať
            </button>
          </form>
        </div>
      )}
    </>
  );
}
