// app/page.tsx  (Server Component)
import Image from "next/image";
import ChatWidget from "@/components/ChatWidget";   // ✅ exact file & name
import FAQChips from "@/components/FAQChips";      // ✅ chips are client-only

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
    <main style={{ padding: "20px", fontFamily: "system-ui, Arial, sans-serif" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Image src="/logo.png" alt="Bloom Robbins" width={180} height={42} />
        <h1 style={{ fontSize: 20, margin: 0 }}>Bloom Chatbot</h1>
      </header>

      {/* FAQ chips (client) */}
      <FAQChips items={FAQ} />

      {/* Support note */}
      <p style={{ fontSize: 12, color: "#666", marginTop: 12 }}>
        Ak nedostaneš odpoveď, kontaktuj podporu:{" "}
        <a href="mailto:hello@bloomrobbins.sk">hello@bloomrobbins.sk</a> · +421 908 740 020 (Po–Pia 8:00–16:00)
      </p>

      {/* Floating chat bubble */}
      <ChatWidget />
    </main>
  );
}
