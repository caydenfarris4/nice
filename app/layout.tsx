import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "nice",
  description: "Projects, sources, and analysis lenses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-black/10 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">nice</Link>
            <span className="text-xs text-black/50">local · v0.1</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
