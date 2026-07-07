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
    <section className="animate-fade-up px-[30px] py-7 pb-10">
      <Link href="/admin" className="text-[12.5px] text-muted hover:text-foreground">
        ← Retour
      </Link>
      <h1 className="mb-6 mt-2 font-display text-[22px] font-semibold text-heading">
        Ajouter une musique
      </h1>
      <SongForm assets={assets} />
    </section>
  );
}
