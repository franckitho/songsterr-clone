import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SongForm } from "@/components/SongForm";

export const dynamic = "force-dynamic";

export default async function NewSongPage() {
  const assets = await prisma.asset.findMany({
    where: { type: "SOUNDFONT" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Retour
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Ajouter une musique</h1>
      <SongForm assets={assets} />
    </div>
  );
}
