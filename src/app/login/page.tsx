"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction } from "@/lib/actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <form
        action={formAction}
        className="w-full max-w-sm bg-surface border border-border rounded-xl p-6 space-y-4"
      >
        <div>
          <h1 className="text-xl font-bold">Connexion admin</h1>
          <p className="text-sm text-muted mt-1">
            Réservé à la gestion du catalogue.
          </p>
        </div>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="block text-sm">
          <span className="text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-md bg-surface-2 border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md bg-surface-2 border border-border px-3 py-2 outline-none focus:border-accent"
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent text-black font-medium py-2 hover:bg-accent-strong transition disabled:opacity-60"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
