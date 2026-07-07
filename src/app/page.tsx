import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SongCard } from "@/components/SongCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; difficulty?: string }>;
}) {
  const { q, difficulty } = await searchParams;
  const query = q?.trim();

  const songs = await prisma.song.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query } },
                { artist: { contains: query } },
                { album: { contains: query } },
              ],
            }
          : {},
        difficulty ? { difficulty } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      artist: true,
      album: true,
      genre: true,
      difficulty: true,
      fileFormat: true,
    },
  });

  return (
    <section className="animate-fade-up px-[30px] py-7 pb-10">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-[19px] font-semibold text-heading">
            {query ? `Résultats pour « ${query} »` : "Populaires cette semaine"}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {songs.length} morceau{songs.length > 1 ? "x" : ""} · joue avec le son et la tablature
            synchronisés.
          </p>
        </div>
        <SearchBar defaultValue={query} defaultDifficulty={difficulty} />
      </div>

      {songs.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-border-strong p-12 text-center text-muted">
          <p className="mb-3">
            Aucun morceau {query ? "ne correspond à ta recherche" : "pour l’instant"}.
          </p>
          <Link href="/admin/songs/new" className="text-accent hover:underline">
            + Ajouter une musique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-[18px]">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </section>
  );
}
