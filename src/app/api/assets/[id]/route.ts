import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";
import { deleteFile } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Songs referencing this soundfont fall back to the default one (onDelete: SetNull).
  await prisma.asset.delete({ where: { id } });
  await deleteFile(existing.filePath);

  return NextResponse.json({ ok: true });
}
