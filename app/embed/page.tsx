// app/embed/page.tsx
import ChatWidget from "@/components/ChatWidget";
import "@/app/globals.css";

export const metadata = { robots: "noindex" };

export default function Embed() {
  return (
    <html>
      <body style={{ margin: 0, background: "transparent" as any }}>
        <ChatWidget />
      </body>
    </html>
  );
}
