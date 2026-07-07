import type { Metadata } from "next";
import { Manrope, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fretline — clone Songsterr",
  description: "Jouez des tablatures Guitar Pro avec le son et le curseur synchronisés.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const isAdmin = !!session;

  return (
    <html
      lang="fr"
      className={`h-full antialiased ${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="h-full overflow-hidden bg-bg text-foreground">
        <div className="flex h-screen overflow-hidden">
          <Sidebar isAdmin={isAdmin} />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar isAdmin={isAdmin} />
            <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
