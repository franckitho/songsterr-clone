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
    <div className="flex min-h-full items-center justify-center p-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-[16px] border border-border bg-surface p-6"
      >
        <div>
          <h1 className="font-display text-[20px] font-semibold text-heading">Connexion admin</h1>
          <p className="mt-1 text-sm text-muted-2">Réservé à la gestion du catalogue.</p>
        </div>
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <label className="block text-[12px] font-semibold text-muted">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className={loginInput}
          />
        </label>
        <label className="block text-[12px] font-semibold text-muted">
          Mot de passe
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={loginInput}
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[11px] bg-accent py-3 text-[14px] font-bold text-accent-ink hover:bg-accent-strong transition-colors disabled:opacity-60"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

const loginInput =
  "mt-1.5 block w-full rounded-[10px] border border-border-strong bg-white/[0.04] px-[13px] py-[11px] text-[14px] text-[#e8ebf0] outline-none";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
