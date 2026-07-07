import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AssetManager } from "@/components/AssetManager";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="animate-fade-up max-w-3xl px-[30px] py-7 pb-10">
      <Link href="/admin" className="text-[12.5px] text-muted hover:text-foreground">
        ← Retour
      </Link>
      <h1 className="mb-2 mt-2 font-display text-[22px] font-semibold text-heading">
        Bibliothèque d’assets
      </h1>
      <p className="mb-6 text-sm text-muted">
        Uploade des soundfonts (.sf2/.sf3) pour changer le timbre des instruments à la lecture.
        Associe-les ensuite à un morceau depuis son formulaire.
      </p>
      <AssetManager
        assets={assets.map((a) => ({
          id: a.id,
          name: a.name,
          size: a.size,
          createdAt: a.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
