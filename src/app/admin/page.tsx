import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_LABELS } from "@/lib/formats";
import { DeleteSongButton } from "@/components/DeleteSongButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [songs, assetCount] = await Promise.all([
    prisma.song.findMany({
      orderBy: { createdAt: "desc" },
      include: { soundfont: true },
    }),
    prisma.asset.count(),
  ]);

  return (
    <section className="animate-fade-up px-[30px] py-7 pb-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-display text-[22px] font-semibold text-heading">Administration</h1>
        <div className="flex gap-2.5">
          <Link
            href="/admin/assets"
            className="rounded-[10px] border border-border-strong bg-white/[0.04] px-4 py-2.5 text-[13px] font-semibold text-muted hover:text-foreground transition-colors"
          >
            Assets ({assetCount})
          </Link>
          <Link
            href="/admin/songs/new"
            className="rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-ink hover:bg-accent-strong transition-colors"
          >
            + Ajouter une musique
          </Link>
        </div>
      </div>

      {songs.length === 0 ? (
        <p className="text-muted">Aucun morceau. Commence par en ajouter un.</p>
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
            <div className="text-[14px] font-bold text-heading">Bibliothèque</div>
            <div className="text-[12px] text-muted">
              {songs.length} morceau{songs.length > 1 ? "x" : ""}
            </div>
          </div>

          <div className="hidden grid-cols-[2.2fr_1.4fr_1fr_1.2fr_1.2fr] gap-3 border-b border-border px-[22px] py-3 text-[11px] font-bold tracking-[0.06em] text-faint sm:grid">
            <div>TITRE</div>
            <div>DIFFICULTÉ</div>
            <div>FORMAT</div>
            <div>SOUNDFONT</div>
            <div className="text-right">ACTIONS</div>
          </div>

          {songs.map((song) => (
            <div
              key={song.id}
              className="grid grid-cols-2 items-center gap-3 border-b border-white/[0.04] px-[22px] py-[15px] sm:grid-cols-[2.2fr_1.4fr_1fr_1.2fr_1.2fr]"
            >
              <div className="min-w-0">
                <Link
                  href={`/song/${song.id}`}
                  className="block truncate text-[14px] font-semibold text-[#e8ebf0] hover:text-accent"
                >
                  {song.title}
                </Link>
                <div className="truncate text-[12px] text-muted-2">{song.artist}</div>
              </div>
              <div className="hidden text-[13px] text-[#aeb6c2] sm:block">
                {song.difficulty ? DIFFICULTY_LABELS[song.difficulty] ?? song.difficulty : "—"}
              </div>
              <div className="hidden font-mono text-[12px] uppercase text-[#aeb6c2] sm:block">
                {song.fileFormat}
              </div>
              <div className="hidden truncate text-[13px] text-[#aeb6c2] sm:block">
                {song.soundfont?.name ?? "défaut"}
              </div>
              <div className="flex justify-end gap-[7px]">
                <Link
                  href={`/admin/songs/${song.id}/edit`}
                  className="rounded-[8px] border border-accent/30 bg-accent/10 px-3 py-1.5 text-[12px] font-semibold text-accent"
                >
                  Éditer
                </Link>
                <DeleteSongButton id={song.id} title={song.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
