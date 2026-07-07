"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
};

const homeIcon = (color: string) => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <circle cx="9" cy="9" r="6.2" fill="none" stroke={color} strokeWidth="1.6" />
  </svg>
);

const addIcon = (color: string) => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <rect x="8" y="3" width="2" height="12" rx="1" fill={color} />
    <rect x="3" y="8" width="12" height="2" rx="1" fill={color} />
  </svg>
);

const adminIcon = (color: string) => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <rect x="3" y="3" width="5" height="5" rx="1.2" fill={color} />
    <rect x="10" y="3" width="5" height="5" rx="1.2" fill={color} />
    <rect x="3" y="10" width="5" height="5" rx="1.2" fill={color} />
    <rect x="10" y="10" width="5" height="5" rx="1.2" fill={color} />
  </svg>
);

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const browse: NavItem[] = [
    { href: "/", label: "Catalogue", icon: null!, match: (p) => p === "/" || p.startsWith("/song") },
  ];
  const create: NavItem[] = [
    {
      href: "/admin/songs/new",
      label: "Ajouter",
      icon: null!,
      match: (p) => p.startsWith("/admin/songs"),
    },
    { href: "/admin", label: "Admin", icon: null!, match: (p) => p === "/admin" || p.startsWith("/admin/assets") },
  ];

  const iconFor = (href: string, active: boolean) => {
    const c = active ? "#e9b949" : "#6a7280";
    if (href === "/") return homeIcon(c);
    if (href === "/admin/songs/new") return addIcon(c);
    return adminIcon(c);
  };

  const renderItem = (item: NavItem) => {
    const active = item.match(pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-colors ${
          active
            ? "bg-accent/10 text-heading font-semibold"
            : "text-[#818b99] font-medium hover:text-foreground hover:bg-white/[0.03]"
        }`}
      >
        {iconFor(item.href, active)}
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex w-[246px] flex-none flex-col px-4 py-[22px] border-r border-border bg-sidebar">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-[11px] px-2.5 pb-[22px] pt-1">
        <span className="relative block h-[30px] w-[30px] flex-none">
          <span className="absolute left-0.5 top-[5px] h-0.5 w-[26px]" style={{ background: "#e9b949" }} />
          <span className="absolute left-0.5 top-[11px] h-0.5 w-[26px]" style={{ background: "rgba(233,185,73,.55)" }} />
          <span className="absolute left-0.5 top-[17px] h-0.5 w-[26px]" style={{ background: "rgba(233,185,73,.3)" }} />
          <span className="absolute left-0.5 top-[23px] h-0.5 w-[26px]" style={{ background: "rgba(233,185,73,.16)" }} />
        </span>
        <span className="font-display text-[18px] font-bold tracking-[0.14em] text-heading">FRETLINE</span>
      </Link>

      <div className="px-3 pb-2 pt-1.5 text-[10.5px] font-bold tracking-[0.14em] text-faint">BROWSE</div>
      <nav className="flex flex-col gap-[3px]">{browse.map(renderItem)}</nav>

      <div className="px-3 pb-2 pt-[22px] text-[10.5px] font-bold tracking-[0.14em] text-faint">CRÉER</div>
      <nav className="flex flex-col gap-[3px]">{create.map(renderItem)}</nav>

      <div className="flex-1" />

      {/* Auth footer — mirrors the mockup's profile chip. */}
      {isAdmin ? (
        <div className="flex items-center gap-[11px] px-1.5 py-2">
          <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-[#2a3340] text-[13px] font-bold text-[#c9d1dc]">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-[#e8ebf0]">Admin</div>
            <form action={logoutAction}>
              <button type="submit" className="text-[11px] text-muted-2 hover:text-danger">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 rounded-[11px] bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-ink hover:bg-accent-strong transition-colors"
        >
          Connexion admin
        </Link>
      )}
    </aside>
  );
}
