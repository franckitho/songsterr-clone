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
    <div className="mx-auto max-w-5xl w-full px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Administration</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/assets"
            className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-2 transition"
          >
            Assets ({assetCount})
          </Link>
          <Link
            href="/admin/songs/new"
            className="rounded-md bg-accent text-black font-medium px-4 py-2 text-sm hover:bg-accent-strong transition"
          >
            + Ajouter une musique
          </Link>
        </div>
      </div>

      {songs.length === 0 ? (
        <p className="text-muted">Aucun morceau. Commence par en ajouter un.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Titre</th>
                <th className="px-4 py-2 font-medium">Artiste</th>
                <th className="px-4 py-2 font-medium">Difficulté</th>
                <th className="px-4 py-2 font-medium">Format</th>
                <th className="px-4 py-2 font-medium">Soundfont</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {songs.map((song) => (
                <tr key={song.id} className="hover:bg-surface/50">
                  <td className="px-4 py-2">
                    <Link href={`/song/${song.id}`} className="hover:text-accent">
                      {song.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted">{song.artist}</td>
                  <td className="px-4 py-2 text-muted">
                    {song.difficulty ? DIFFICULTY_LABELS[song.difficulty] ?? song.difficulty : "—"}
                  </td>
                  <td className="px-4 py-2 text-muted uppercase text-xs">{song.fileFormat}</td>
                  <td className="px-4 py-2 text-muted">{song.soundfont?.name ?? "défaut"}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/songs/${song.id}/edit`}
                        className="text-muted hover:text-accent"
                      >
                        Éditer
                      </Link>
                      <DeleteSongButton id={song.id} title={song.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
