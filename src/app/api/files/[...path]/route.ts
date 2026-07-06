import { NextRequest, NextResponse } from "next/server";
import { statSync } from "node:fs";
import { openReadStream, resolveStoragePath } from "@/lib/storage";
import { extname } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".sf2": "application/octet-stream",
  ".sf3": "application/octet-stream",
  ".musicxml": "application/xml",
  ".xml": "application/xml",
  ".mxl": "application/octet-stream",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const relativePath = path.join("/");
  const abs = resolveStoragePath(relativePath);
  if (!abs) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  const stream = openReadStream(relativePath);
  if (!stream) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  const ext = extname(relativePath);
  const size = statSync(abs).size;

  // Node Readable -> Web ReadableStream for the Response body.
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(new Uint8Array(chunk as Buffer)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Length": String(size),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
