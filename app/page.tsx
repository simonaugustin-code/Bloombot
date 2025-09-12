// app/page.tsx  (Server Component)
import Image from "next/image";
import ChatWidget from "../components/ChatWidget";   // ✅ relative path
import FAQChips from "../components/FAQChips";       // ✅ new client component

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
        {/* Ensure logo file is in /public/logo.png at the repo root */}
        <Image src="/logo.png" alt="Bloom Robbins" width={200} height={50} priority />
        <h1 style={{ fontSize: 22, margin: 0 }}>Bloom Chatbot</h1>
      </div>

      {/* FAQ chips (client-side, interactive) */}
      <FAQChips items={FAQ} />

      {/* Contact fallback (static) */}
      <p style={{ fontSize: 13, color: "#555" }}>
        Ak nedostaneš odpoveď, kontaktuj podporu:{" "}
        <a href="mailto:hello@bloomrobbins.sk">hello@bloomrobbins.sk</a> • +421 908 740 020 (Po–Pia 8:00–16:00)
      </p>

      {/* Floating bubble + panel */}
      <ChatWidget />
    </main>
  );
}
