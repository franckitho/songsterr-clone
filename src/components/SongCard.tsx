import Link from "next/link";
import { DIFFICULTY_LABELS } from "@/lib/formats";

export type SongCardData = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  difficulty: string | null;
  fileFormat: string;
};

export function SongCard({ song }: { song: SongCardData }) {
  return (
    <Link
      href={`/song/${song.id}`}
      className="group block rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-accent/50 transition overflow-hidden"
    >
      <div className="aspect-[16/9] bg-gradient-to-br from-surface-2 to-bg flex items-center justify-center relative">
        <span className="text-4xl opacity-30 group-hover:opacity-60 group-hover:text-accent transition">
          🎸
        </span>
        <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-black/40 text-muted">
          {song.fileFormat}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold leading-tight truncate group-hover:text-accent transition">
          {song.title}
        </h3>
        <p className="text-sm text-muted truncate">{song.artist}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {song.difficulty && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted">
              {DIFFICULTY_LABELS[song.difficulty] ?? song.difficulty}
            </span>
          )}
          {song.genre && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-2 border border-border text-muted">
              {song.genre}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
