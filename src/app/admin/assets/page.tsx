import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AssetManager } from "@/components/AssetManager";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-8">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Retour
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-2">Bibliothèque d’assets</h1>
      <p className="text-muted text-sm mb-6">
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
    </div>
  );
}
