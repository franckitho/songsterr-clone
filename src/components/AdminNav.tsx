import Link from "next/link";
import { logoutAction } from "@/lib/actions";

export function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="px-3 py-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition"
      >
        Catalogue
      </Link>
      {isAdmin ? (
        <>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-2 transition"
          >
            Admin
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md text-muted hover:text-danger hover:bg-surface-2 transition"
            >
              Déconnexion
            </button>
          </form>
        </>
      ) : (
        <Link
          href="/login"
          className="px-3 py-1.5 rounded-md bg-accent text-black font-medium hover:bg-accent-strong transition"
        >
          Connexion admin
        </Link>
      )}
    </nav>
  );
}
