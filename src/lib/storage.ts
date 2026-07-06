import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { join, normalize, resolve } from "node:path";

// Root of the on-disk storage. Kept outside of /public so uploads are only
// ever served through the guarded /api/files route.
const STORAGE_ROOT = resolve(process.cwd(), "storage");

export type StorageBucket = "tabs" | "assets";

function bucketDir(bucket: StorageBucket): string {
  return join(STORAGE_ROOT, bucket);
}

/** Resolve a stored relative path (e.g. "tabs/xyz.gp") to an absolute path,
 *  refusing anything that would escape the storage root. */
export function resolveStoragePath(relativePath: string): string | null {
  const normalized = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const abs = resolve(STORAGE_ROOT, normalized);
  if (abs !== STORAGE_ROOT && !abs.startsWith(STORAGE_ROOT + "/")) return null;
  return abs;
}

/** Persist an uploaded file and return its storage-relative path. */
export async function saveFile(
  bucket: StorageBucket,
  originalName: string,
  data: Buffer,
): Promise<string> {
  await mkdir(bucketDir(bucket), { recursive: true });
  const ext = extname(originalName);
  const fileName = `${randomUUID()}${ext}`;
  const relativePath = `${bucket}/${fileName}`;
  await writeFile(join(STORAGE_ROOT, relativePath), data);
  return relativePath;
}

export async function deleteFile(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) return;
  const abs = resolveStoragePath(relativePath);
  if (abs && existsSync(abs)) {
    await unlink(abs).catch(() => {});
  }
}

export function openReadStream(relativePath: string) {
  const abs = resolveStoragePath(relativePath);
  if (!abs || !existsSync(abs)) return null;
  return createReadStream(abs);
}

export function fileExists(relativePath: string): boolean {
  const abs = resolveStoragePath(relativePath);
  return !!abs && existsSync(abs);
}

/** Lowercase extension including the dot, e.g. ".gp5". */
export function extname(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx).toLowerCase() : "";
}
