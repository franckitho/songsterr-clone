import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { extname, saveFile } from "@/lib/storage";
import { fileFormatFromExt, isTabFile } from "@/lib/formats";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const where = q
    ? {
        OR: [
          { title: { contains: q } },
          { artist: { contains: q } },
          { album: { contains: q } },
        ],
      }
    : {};
  const songs = await prisma.song.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { soundfont: true },
  });
  return NextResponse.json(songs);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData();
  const file = form.get("file");
  const title = String(form.get("title") ?? "").trim();
  const artist = String(form.get("artist") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier de tablature manquant" }, { status: 400 });
  }
  if (!title || !artist) {
    return NextResponse.json({ error: "Titre et artiste sont requis" }, { status: 400 });
  }

  const ext = extname(file.name);
  if (!isTabFile(ext)) {
    return NextResponse.json(
      { error: `Format non supporté (${ext || "inconnu"}). Utilise un fichier Guitar Pro ou MusicXML.` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await saveFile("tabs", file.name, buffer);

  const song = await prisma.song.create({
    data: {
      title,
      artist,
      album: optional(form.get("album")),
      genre: optional(form.get("genre")),
      difficulty: optional(form.get("difficulty")),
      tuning: optional(form.get("tuning")),
      soundfontId: optional(form.get("soundfontId")),
      filePath,
      fileFormat: fileFormatFromExt(ext),
    },
  });

  return NextResponse.json(song, { status: 201 });
}

function optional(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length ? s : null;
}
