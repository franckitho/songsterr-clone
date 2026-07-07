"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SOUNDFONT_EXTENSIONS } from "@/lib/formats";

export type AssetRow = {
  id: string;
  name: string;
  size: number;
  createdAt: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function AssetManager({ assets }: { assets: AssetRow[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUploading(true);
    try {
      const form = e.currentTarget;
      const res = await fetch("/api/assets", { method: "POST", body: new FormData(form) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Échec de l’upload");
      }
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!confirm(`Supprimer le soundfont « ${name} » ?`)) return;
    const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Échec de la suppression.");
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={onUpload}
        className="space-y-3 rounded-[16px] border border-border bg-surface p-[22px]"
      >
        <h2 className="text-[13px] font-bold text-heading">Uploader un soundfont</h2>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-[12px] font-semibold text-muted">
            Nom
            <input
              name="name"
              placeholder="ex: Clean Guitar SF2"
              className="mt-1.5 block w-full rounded-[10px] border border-border-strong bg-white/[0.04] px-[13px] py-[11px] text-[14px] text-[#e8ebf0] outline-none"
            />
          </label>
          <label className="block text-[12px] font-semibold text-muted">
            Fichier ({SOUNDFONT_EXTENSIONS.join(", ")})
            <input
              name="file"
              type="file"
              accept={SOUNDFONT_EXTENSIONS.join(",")}
              required
              className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-[10px] file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-accent-ink hover:file:bg-accent-strong"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-ink hover:bg-accent-strong transition-colors disabled:opacity-60"
        >
          {uploading ? "Upload…" : "Uploader"}
        </button>
      </form>

      {assets.length === 0 ? (
        <p className="text-sm text-muted">
          Aucun soundfont uploadé. Le soundfont par défaut (sonivox) est utilisé pour tous les
          morceaux.
        </p>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          {assets.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 border-b border-white/[0.04] px-[22px] py-[15px] last:border-b-0"
            >
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold text-[#e8ebf0]">{a.name}</div>
                <div className="font-mono text-[12px] text-muted-2">{formatSize(a.size)}</div>
              </div>
              <button
                onClick={() => onDelete(a.id, a.name)}
                className="rounded-[8px] border border-border-strong bg-transparent px-3 py-1.5 text-[12px] font-semibold text-muted hover:border-danger hover:text-danger"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
