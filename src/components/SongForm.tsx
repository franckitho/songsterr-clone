"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES, DIFFICULTY_LABELS, TAB_EXTENSIONS } from "@/lib/formats";

export type AssetOption = { id: string; name: string };

export type SongFormValues = {
  id?: string;
  title?: string;
  artist?: string;
  album?: string | null;
  genre?: string | null;
  difficulty?: string | null;
  tuning?: string | null;
  soundfontId?: string | null;
  fileFormat?: string;
};

export function SongForm({
  song,
  assets,
}: {
  song?: SongFormValues;
  assets: AssetOption[];
}) {
  const router = useRouter();
  const isEdit = !!song?.id;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const url = isEdit ? `/api/songs/${song!.id}` : "/api/songs";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Échec de l’enregistrement");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      {error && (
        <div className="rounded-md border border-danger/50 bg-danger/10 text-danger px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Titre *">
          <input name="title" required defaultValue={song?.title ?? ""} className={inputCls} />
        </Field>
        <Field label="Artiste *">
          <input name="artist" required defaultValue={song?.artist ?? ""} className={inputCls} />
        </Field>
        <Field label="Album">
          <input name="album" defaultValue={song?.album ?? ""} className={inputCls} />
        </Field>
        <Field label="Genre">
          <input name="genre" defaultValue={song?.genre ?? ""} className={inputCls} />
        </Field>
        <Field label="Difficulté">
          <select name="difficulty" defaultValue={song?.difficulty ?? ""} className={inputCls}>
            <option value="">—</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Accordage (info)">
          <input
            name="tuning"
            defaultValue={song?.tuning ?? ""}
            placeholder="ex: Standard, Drop D…"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Soundfont (timbre du son)">
        <select name="soundfontId" defaultValue={song?.soundfontId ?? ""} className={inputCls}>
          <option value="">Soundfont par défaut (sonivox)</option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={
          isEdit ? "Remplacer le fichier de tablature (optionnel)" : "Fichier de tablature *"
        }
      >
        <input
          name="file"
          type="file"
          accept={TAB_EXTENSIONS.join(",")}
          required={!isEdit}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:text-black file:px-3 file:py-1.5 file:font-medium hover:file:bg-accent-strong"
        />
        <p className="text-xs text-muted mt-1">
          Formats acceptés : Guitar Pro ({TAB_EXTENSIONS.filter((e) => e.startsWith(".gp")).join(", ")})
          et MusicXML (.musicxml, .xml, .mxl).
          {isEdit && song?.fileFormat && (
            <> Fichier actuel : <span className="text-foreground">.{song.fileFormat}</span>.</>
          )}
        </p>
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent text-black font-medium px-5 py-2 hover:bg-accent-strong transition disabled:opacity-60"
        >
          {submitting ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Ajouter le morceau"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-md border border-border px-5 py-2 text-muted hover:text-foreground hover:bg-surface-2 transition"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "mt-1 w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-sm outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}
