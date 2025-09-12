"use client";

type Props = { items: string[] };

export default function FAQChips({ items }: Props) {
  const prefill = (q: string) => {
    document.dispatchEvent(new CustomEvent("br-chat:prefill", { detail: q }));
  };

  return (
    <div className="chips">
      {items.map((q) => (
        <button key={q} className="chip" onClick={() => prefill(q)}>
          {q}
        </button>
      ))}
    </div>
  );
}
