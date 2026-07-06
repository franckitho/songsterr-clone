import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TabPlayer } from "@/components/TabPlayer";
import { DIFFICULTY_LABELS } from "@/lib/formats";

export const dynamic = "force-dynamic";

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await prisma.song.findUnique({
    where: { id },
    include: { soundfont: true },
  });
  if (!song) notFound();

  const fileUrl = `/api/files/${song.filePath}`;
  const soundFontUrl = song.soundfont ? `/api/files/${song.soundfont.filePath}` : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="border-b border-border bg-surface px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Link href="/" className="text-xs text-muted hover:text-foreground">
            ← Catalogue
          </Link>
          <h1 className="text-lg font-bold truncate">{song.title}</h1>
          <p className="text-sm text-muted truncate">
            {song.artist}
            {song.album ? ` · ${song.album}` : ""}
            {song.tuning ? ` · ${song.tuning}` : ""}
            {song.difficulty
              ? ` · ${DIFFICULTY_LABELS[song.difficulty] ?? song.difficulty}`
              : ""}
          </p>
        </div>
      </div>

      {/* Fixed-height player area so the notation viewport can scroll internally. */}
      <div className="flex-1 min-h-0" style={{ height: "calc(100vh - 8.5rem)" }}>
        <TabPlayer fileUrl={fileUrl} soundFontUrl={soundFontUrl} />
      </div>
    </div>
  );
}
