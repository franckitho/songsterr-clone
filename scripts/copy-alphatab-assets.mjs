// Copies alphaTab runtime assets (Bravura font + default soundfont) into
// public/alphatab so they can be served statically to the browser.
import { cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "@coderline", "alphatab", "dist");
const dest = join(root, "public", "alphatab");

async function main() {
  await mkdir(dest, { recursive: true });
  // Copy the whole dist so the UMD script, its worker/worklet siblings, the
  // Bravura font and the default soundfont are all served from one place.
  await cp(src, dest, { recursive: true });
  console.log("[alphatab] assets copied to public/alphatab");
}

main().catch((err) => {
  console.error("[alphatab] failed to copy assets:", err);
  process.exit(1);
});
