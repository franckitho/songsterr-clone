import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { auth } from "@/auth";
import { AdminNav } from "@/components/AdminNav";

export const metadata: Metadata = {
  title: "TabPlayer — clone Songsterr",
  description: "Jouez des tablatures Guitar Pro avec le son et le curseur synchronisés.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const isAdmin = !!session;

  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-foreground">
        <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30">
          <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="text-accent">▶</span>
              <span>TabPlayer</span>
            </Link>
            <AdminNav isAdmin={isAdmin} />
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-border text-xs text-muted py-3 text-center">
          Rendered using alphaTab · projet perso façon Songsterr
        </footer>
      </body>
    </html>
  );
}
