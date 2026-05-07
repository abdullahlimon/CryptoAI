import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "CryptoAI Terminal",
  description: "Personal AI-powered crypto research terminal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TopNav />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-4">
          {children}
        </main>
      </body>
    </html>
  );
}
