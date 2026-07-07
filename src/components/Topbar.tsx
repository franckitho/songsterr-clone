"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

/** Derive the topbar title/subtitle from the current route. */
function titleFor(pathname: string): [string, string] {
  if (pathname === "/") return ["Catalogue", "Choisis un morceau pour jouer en synchro"];
  if (pathname.startsWith("/song")) return ["Lecteur", "Tablature et son synchronisés"];
  if (pathname === "/admin/songs/new") return ["Ajouter une musique", "Publier une nouvelle tablature"];
  if (pathname.includes("/admin/songs")) return ["Éditer", "Modifier une tablature"];
  if (pathname.startsWith("/admin/assets")) return ["Assets", "Soundfonts de la bibliothèque"];
  if (pathname.startsWith("/admin")) return ["Admin", "Bibliothèque & modération"];
  if (pathname.startsWith("/login")) return ["Connexion admin", "Gestion du catalogue"];
  return ["Fretline", ""];
}

export function Topbar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [title, sub] = titleFor(pathname);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
  }

  return (
    <header className="flex h-[70px] flex-none items-center justify-between gap-5 border-b border-border bg-sidebar/60 px-5 backdrop-blur-md sm:px-[30px]">
      <div className="min-w-0">
        <div className="truncate font-display text-[19px] font-semibold text-heading">{title}</div>
        <div className="text-[12.5px] text-muted-2">{sub}</div>
      </div>

      <div className="flex items-center gap-3.5">
        <form
          onSubmit={search}
          className="hidden items-center gap-2.5 rounded-[10px] border border-border bg-white/[0.04] px-3.5 py-2.5 sm:flex sm:w-[240px] md:w-[280px]"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden className="flex-none">
            <circle cx="6.5" cy="6.5" r="4.4" fill="none" stroke="#6a7280" strokeWidth="1.5" />
            <line x1="9.8" y1="9.8" x2="13" y2="13" stroke="#6a7280" strokeWidth="1.5" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un titre, artiste…"
            className="w-full min-w-0 border-none bg-transparent text-[13px] text-[#e8ebf0] placeholder:text-muted-2"
          />
        </form>

        <Link
          href="/admin/songs/new"
          className="flex items-center gap-[7px] rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-ink hover:bg-accent-strong transition-colors"
        >
          + Nouvelle tab
        </Link>

        <Link
          href={isAdmin ? "/admin" : "/login"}
          title={isAdmin ? "Admin" : "Connexion"}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#2a3340] text-[13px] font-bold text-[#c9d1dc]"
        >
          {isAdmin ? "AD" : "?"}
        </Link>
      </div>
    </header>
  );
}
