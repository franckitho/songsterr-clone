import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SongForm } from "@/components/SongForm";

export const dynamic = "force-dynamic";

export default async function EditSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [song, assets] = await Promise.all([
    prisma.song.findUnique({ where: { id } }),
    prisma.asset.findMany({
      where: { type: "SOUNDFONT" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!song) notFound();

  return (
    <section className="animate-fade-up px-[30px] py-7 pb-10">
      <Link href="/admin" className="text-[12.5px] text-muted hover:text-foreground">
        ← Retour
      </Link>
      <h1 className="mb-6 mt-2 font-display text-[22px] font-semibold text-heading">
        Éditer : {song.title}
      </h1>
      <SongForm song={song} assets={assets} />
    </section>
  );
}
