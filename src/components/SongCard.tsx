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

// A small palette of cover gradients, picked deterministically from the title
// so each card keeps a stable tint (mirrors the mockup's varied cover art).
const TINTS = [
  "linear-gradient(140deg,#2b3a3f,#18211f)",
  "linear-gradient(140deg,#33263f,#1c1826)",
  "linear-gradient(140deg,#3a2b22,#1f1815)",
  "linear-gradient(140deg,#222c3a,#161b22)",
  "linear-gradient(140deg,#24332a,#161e19)",
  "linear-gradient(140deg,#2f3325,#1a1c15)",
];

function tintFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

export function SongCard({ song }: { song: SongCardData }) {
  const initial = (song.title.trim()[0] ?? "♪").toUpperCase();

  return (
    <Link
      href={`/song/${song.id}`}
      className="group block overflow-hidden rounded-[14px] border border-border bg-surface transition-colors hover:border-accent/40"
    >
      <div
        className="relative flex h-[120px] items-center justify-center"
        style={{ background: tintFor(song.id) }}
      >
        <span className="font-display text-[44px] font-bold text-white/85">{initial}</span>
        <span className="absolute left-2.5 top-2.5 rounded-full bg-accent px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-[0.05em] text-accent-ink">
          {song.fileFormat}
        </span>
      </div>
      <div className="px-3.5 pb-[15px] pt-3.5">
        <div className="truncate text-[14.5px] font-bold text-heading">{song.title}</div>
        <div className="mt-0.5 truncate text-[12.5px] text-muted">{song.artist}</div>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-muted-2">
            {song.difficulty ? DIFFICULTY_LABELS[song.difficulty] ?? song.difficulty : "—"}
          </span>
          {song.genre && (
            <span className="truncate pl-2 font-mono text-[11.5px] text-[#6a7280]">{song.genre}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
