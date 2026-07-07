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
    <section className="animate-fade-up flex h-full min-h-0 flex-col px-[26px] pb-6 pt-5">
      <div className="mb-3.5 flex-none">
        <Link href="/" className="cursor-pointer text-[12.5px] text-[#8b95a3] hover:text-foreground">
          ← Catalogue
        </Link>
        <h1 className="mb-0.5 mt-[7px] font-display text-[24px] font-bold text-heading">
          {song.title}
        </h1>
        <div className="text-[13px] text-[#8b95a3]">
          {song.artist}
          {song.album ? ` · ${song.album}` : ""}
          {song.tuning ? ` · ${song.tuning}` : ""}
          {song.difficulty ? (
            <>
              {" · "}
              <span className="text-accent">
                {DIFFICULTY_LABELS[song.difficulty] ?? song.difficulty}
              </span>
            </>
          ) : (
            ""
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <TabPlayer fileUrl={fileUrl} soundFontUrl={soundFontUrl} />
      </div>
    </section>
  );
}
