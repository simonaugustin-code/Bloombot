// app/page.tsx  (Server Component)
import Image from "next/image";
import ChatWidget from "@/components/ChatWidget"; // ✅ IMPORT THE WIDGET

// Helper to dispatch a prefill event for the widget (runs on client after click)
function prefillJS(question: string) {
  return `
    (function(){
      const ev = new CustomEvent("br-chat:prefill", { detail: ${JSON.stringify(question)} });
      document.dispatchEvent(ev);
    })()
  `;
}

const FAQ = [
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
  return (
    <main style={{ padding: "20px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        {/* If you moved logo into /public/logo.png this will work */}
        <Image src="/logo.png" alt="Bloom Robbins" width={200} height={50} priority />
        <h1 style={{ fontSize: 22, margin: 0 }}>Bloom Chatbot</h1>
      </div>

      {/* FAQ chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {FAQ.map((q) => (
          <button
            key={q}
            onClick={() => {}}
            dangerouslySetInnerHTML={{ __html: q }}
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: "1px solid #e2e2e2",
              background: "#fff",
              cursor: "pointer",
              fontSize: 13,
            }}
            // Use a small inline script to fire the prefill event
            onMouseDown={(e) => {
              // small trick to run the script without adding 'use client' here
              const s = document.createElement("script");
              s.innerHTML = prefillJS(q);
              document.body.appendChild(s);
              setTimeout(() => s.remove(), 0);
            }}
          />
        ))}
      </div>

      {/* Contact fallback (static) */}
      <p style={{ fontSize: 13, color: "#555" }}>
        Ak nedostaneš odpoveď, kontaktuj podporu:{" "}
        <a href="mailto:hello@bloomrobbins.sk">hello@bloomrobbins.sk</a> • +421 908 740 020 (Po–Pia 8:00–16:00)
      </p>

      {/* Floating chat bubble + panel (client component) */}
      <ChatWidget />
    </main>
  );
}
