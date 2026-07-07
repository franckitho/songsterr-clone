"use client";

import { useRouter } from "next/navigation";
import { DIFFICULTIES, DIFFICULTY_LABELS } from "@/lib/formats";

/**
 * Difficulty filter for the catalogue. The free-text search lives in the topbar;
 * this keeps the current query (`q`) intact while switching difficulty, matching
 * the mockup's segmented filter row.
 */
export function SearchBar({
  defaultValue,
  defaultDifficulty,
}: {
  defaultValue?: string;
  defaultDifficulty?: string;
}) {
  const router = useRouter();
  const active = defaultDifficulty ?? "";

  function apply(nextDifficulty: string) {
    const params = new URLSearchParams();
    if (defaultValue?.trim()) params.set("q", defaultValue.trim());
    if (nextDifficulty) params.set("difficulty", nextDifficulty);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  const pill = (value: string, label: string) => {
    const on = active === value;
    return (
      <button
        key={value || "all"}
        onClick={() => apply(value)}
        className={`rounded-[10px] px-[15px] py-2 text-[13px] font-semibold transition-colors ${
          on
            ? "bg-accent text-accent-ink"
            : "border border-border bg-white/[0.04] text-muted hover:text-foreground"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {pill("", "Toutes")}
      {DIFFICULTIES.map((d) => pill(d, DIFFICULTY_LABELS[d]))}
    </div>
  );
}
