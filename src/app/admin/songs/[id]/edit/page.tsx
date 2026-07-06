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
    <div className="mx-auto max-w-3xl w-full px-4 py-8">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Retour
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Éditer : {song.title}</h1>
      <SongForm song={song} assets={assets} />
    </div>
  );
}
