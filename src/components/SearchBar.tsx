"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES, DIFFICULTY_LABELS } from "@/lib/formats";

export function SearchBar({
  defaultValue,
  defaultDifficulty,
}: {
  defaultValue?: string;
  defaultDifficulty?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue ?? "");
  const [difficulty, setDifficulty] = useState(defaultDifficulty ?? "");

  function apply(nextQ: string, nextDifficulty: string) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextDifficulty) params.set("difficulty", nextDifficulty);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        apply(q, difficulty);
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un titre, artiste…"
        className="rounded-md bg-surface border border-border px-3 py-2 text-sm outline-none focus:border-accent w-56"
      />
      <select
        value={difficulty}
        onChange={(e) => {
          setDifficulty(e.target.value);
          apply(q, e.target.value);
        }}
        className="rounded-md bg-surface border border-border px-2 py-2 text-sm outline-none focus:border-accent text-muted"
      >
        <option value="">Toutes difficultés</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {DIFFICULTY_LABELS[d]}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-accent text-black px-4 py-2 text-sm font-medium hover:bg-accent-strong transition"
      >
        OK
      </button>
    </form>
  );
}
