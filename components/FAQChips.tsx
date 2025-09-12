"use client";

type Props = { items: string[] };

export default function FAQChips({ items }: Props) {
  const prefill = (q: string) => {
    const ev = new CustomEvent("br-chat:prefill", { detail: q });
    document.dispatchEvent(ev);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
      {items.map((q) => (
        <button
          key={q}
          onClick={() => prefill(q)}
          style={{
            padding: "8px 10px",
            borderRadius: 999,
            border: "1px solid #e2e2e2",
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
