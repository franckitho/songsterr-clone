import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { extname, saveFile } from "@/lib/storage";
import { isSoundfontFile } from "@/lib/formats";

export async function GET() {
  const assets = await prisma.asset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(assets);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  const name = String(form.get("name") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier soundfont manquant" }, { status: 400 });
  }
  const ext = extname(file.name);
  if (!isSoundfontFile(ext)) {
    return NextResponse.json(
      { error: `Format non supporté (${ext || "inconnu"}). Utilise un .sf2 ou .sf3.` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await saveFile("assets", file.name, buffer);

  const asset = await prisma.asset.create({
    data: {
      name: name || file.name,
      type: "SOUNDFONT",
      filePath,
      size: buffer.length,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
