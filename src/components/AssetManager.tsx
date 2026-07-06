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
        className="rounded-xl border border-border bg-surface p-4 space-y-3"
      >
        <h2 className="font-semibold">Uploader un soundfont</h2>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-muted">Nom</span>
            <input
              name="name"
              placeholder="ex: Clean Guitar SF2"
              className="mt-1 w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Fichier ({SOUNDFONT_EXTENSIONS.join(", ")})</span>
            <input
              name="file"
              type="file"
              accept={SOUNDFONT_EXTENSIONS.join(",")}
              required
              className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:text-black file:px-3 file:py-1.5 file:font-medium hover:file:bg-accent-strong"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-md bg-accent text-black font-medium px-4 py-2 text-sm hover:bg-accent-strong transition disabled:opacity-60"
        >
          {uploading ? "Upload…" : "Uploader"}
        </button>
      </form>

      {assets.length === 0 ? (
        <p className="text-muted text-sm">
          Aucun soundfont uploadé. Le soundfont par défaut (sonivox) est utilisé pour tous les
          morceaux.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Taille</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assets.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2">{a.name}</td>
                  <td className="px-4 py-2 text-muted">{formatSize(a.size)}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onDelete(a.id, a.name)}
                      className="text-muted hover:text-danger"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
