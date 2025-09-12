// app/page.tsx
import Image from "next/image";
// app/page.tsx import ChatWidget from "../components/ChatWidget";

export default function Page() {
  return (
    <main className="br-root">
      <header className="br-header">
        <div className="br-header-inner">
          <Image
            src="/logo.png"
            alt="Bloom Robbins"
            width={160}
            height={34}
            priority
            className="br-logo"
          />
          <span className="br-badge">chatbot</span>
        </div>
      </header>

      <section className="br-hero">
        <h1 className="br-title">Bloom Chatbot</h1>
        <p className="br-sub">
          Pýtaj sa na produkty, zľavy, dopravu a ďalšie. Klikni na bublinu vpravo dole.
        </p>

        <div className="br-chiprow">
          {[
            "Pre koho sú vhodné vaše produkty?",
            "Môžem kombinovať viaceré produkty?",
            "Aký je rozdiel medzi gumíkmi a kapsulami?",
            "Kde nájdem info o zložení a užívaní?",
            "Aké spôsoby platby ponúkate?",
            "Kedy mám nárok na poštovné zadarmo?",
            "Ako si uplatním zľavový kód?",
          ].map((q) => (
            <button
              key={q}
              className="br-chip"
              onClick={() =>
                document.dispatchEvent(
                  new CustomEvent("br-chat:prefill", { detail: q }),
                )
              }
            >
              {q}
            </button>
          ))}
        </div>

        <p className="br-support">
          Ak nedostaneš odpoveď, kontaktuj podporu:{" "}
          <a href="mailto:hello@bloomrobbins.sk">hello@bloomrobbins.sk</a> · +421 908 740 020 (Po–Pia 8:00–16:00)
        </p>
      </section>

      {/* Floating chat bubble */}
      <ChatWidget />
    </main>
  );
}
