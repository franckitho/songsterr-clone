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
    <form onSubmit={onSubmit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
      {error && (
        <div className="rounded-[10px] border border-danger/50 bg-danger/10 px-3 py-2 text-sm text-danger lg:col-span-2">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className={cardCls}>
          <div className={cardTitleCls}>Détails</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Titre *" full>
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
          </div>
        </div>

        <div className={cardCls}>
          <div className={cardTitleCls}>Jeu &amp; son</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
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
            <Field label="Accordage">
              <input
                name="tuning"
                defaultValue={song?.tuning ?? ""}
                placeholder="ex: Standard, Drop D…"
                className={`${inputCls} font-mono`}
              />
            </Field>
            <Field label="Soundfont">
              <select name="soundfontId" defaultValue={song?.soundfontId ?? ""} className={inputCls}>
                <option value="">Défaut (sonivox)</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className={cardCls}>
          <div className={cardTitleCls}>
            {isEdit ? "Remplacer le fichier de tablature" : "Fichier de tablature"}
          </div>
          <div className="rounded-[14px] border-[1.5px] border-dashed border-border-strong bg-white/[0.02] p-[34px] text-center">
            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-[12px] bg-accent/[0.12]">
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
                <rect x="10" y="3" width="2" height="12" rx="1" fill="#e9b949" />
                <path
                  d="M6 8l5-5 5 5"
                  fill="none"
                  stroke="#e9b949"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="4" y="16" width="14" height="2" rx="1" fill="#e9b949" />
              </svg>
            </div>
            <div className="text-[14px] font-semibold text-[#e8ebf0]">
              Dépose un fichier Guitar Pro ou MusicXML
            </div>
            <div className="mt-1 text-[12.5px] text-muted-2">
              {TAB_EXTENSIONS.filter((e) => e.startsWith(".gp")).join(" · ")} · .musicxml
            </div>
            <input
              name="file"
              type="file"
              accept={TAB_EXTENSIONS.join(",")}
              required={!isEdit}
              className="mx-auto mt-4 block text-sm text-muted file:mr-3 file:rounded-[10px] file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-accent-ink hover:file:bg-accent-strong"
            />
            {isEdit && song?.fileFormat && (
              <p className="mt-2 text-xs text-muted-2">
                Fichier actuel : <span className="text-foreground">.{song.fileFormat}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-0">
        <div className={cardCls}>
          <div className="mb-1.5 text-[13px] font-bold text-heading">
            {isEdit ? "Enregistrer les changements ?" : "Prêt à publier ?"}
          </div>
          <div className="mb-4 text-[12.5px] leading-relaxed text-muted-2">
            Le morceau apparaîtra aussitôt dans le catalogue, jouable avec le son et la tablature
            synchronisés.
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mb-2.5 w-full rounded-[11px] bg-accent py-3 text-[14px] font-bold text-accent-ink hover:bg-accent-strong transition-colors disabled:opacity-60"
          >
            {submitting ? "Enregistrement…" : isEdit ? "Mettre à jour" : "Ajouter le morceau"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="w-full rounded-[11px] border border-border-strong bg-transparent py-3 text-[14px] font-semibold text-muted hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}

const cardCls = "rounded-[16px] border border-border bg-surface p-[22px]";
const cardTitleCls = "mb-4 text-[13px] font-bold text-heading";
const inputCls =
  "mt-1.5 block w-full rounded-[10px] border border-border-strong bg-white/[0.04] px-[13px] py-[11px] text-[14px] text-[#e8ebf0] outline-none";

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block text-[12px] font-semibold text-muted ${full ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
