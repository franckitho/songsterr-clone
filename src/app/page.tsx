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
    <div className="mx-auto max-w-7xl w-full px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bibliothèque</h1>
          <p className="text-muted text-sm mt-1">
            {songs.length} morceau{songs.length > 1 ? "x" : ""} · choisis-en un pour jouer avec le
            son et la tablature synchronisés.
          </p>
        </div>
        <SearchBar defaultValue={query} defaultDifficulty={difficulty} />
      </div>

      {songs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          <p className="mb-3">
            Aucun morceau {query ? "ne correspond à ta recherche" : "pour l’instant"}.
          </p>
          <Link href="/admin/songs/new" className="text-accent hover:underline">
            + Ajouter une musique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
