import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { deleteFile, extname, saveFile } from "@/lib/storage";
import { fileFormatFromExt, isTabFile } from "@/lib/formats";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const song = await prisma.song.findUnique({
    where: { id },
    include: { soundfont: true },
  });
  if (!song) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(song);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.song.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const form = await req.formData();
  const data: Record<string, string | null> = {
    title: reqField(form.get("title"), existing.title),
    artist: reqField(form.get("artist"), existing.artist),
    album: optional(form.get("album")),
    genre: optional(form.get("genre")),
    difficulty: optional(form.get("difficulty")),
    tuning: optional(form.get("tuning")),
    soundfontId: optional(form.get("soundfontId")),
  };

  // Optional replacement of the tab file.
  const file = form.get("file");
  let oldFileToDelete: string | null = null;
  if (file instanceof File && file.size > 0) {
    const ext = extname(file.name);
    if (!isTabFile(ext)) {
      return NextResponse.json({ error: `Format non supporté (${ext})` }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = await saveFile("tabs", file.name, buffer);
    (data as Record<string, string | null>).filePath = filePath;
    (data as Record<string, string | null>).fileFormat = fileFormatFromExt(ext);
    oldFileToDelete = existing.filePath;
  }

  const song = await prisma.song.update({ where: { id }, data });
  if (oldFileToDelete) await deleteFile(oldFileToDelete);

  return NextResponse.json(song);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.song.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.song.delete({ where: { id } });
  await deleteFile(existing.filePath);

  return NextResponse.json({ ok: true });
}

function optional(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length ? s : null;
}

function reqField(value: FormDataEntryValue | null, fallback: string): string {
  const s = typeof value === "string" ? value.trim() : "";
  return s.length ? s : fallback;
}
