"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteSongButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) return;
    setBusy(true);
    const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Échec de la suppression.");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      className="rounded-[8px] border border-border-strong bg-transparent px-3 py-1.5 text-[12px] font-semibold text-muted hover:border-danger hover:text-danger disabled:opacity-50"
    >
      {busy ? "…" : "Supprimer"}
    </button>
  );
}
