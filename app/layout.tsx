export const metadata = { title: "Bloom Chatbot" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body style={{fontFamily: "system-ui, Arial, sans-serif"}}>{children}</body>
    </html>
  );
}
