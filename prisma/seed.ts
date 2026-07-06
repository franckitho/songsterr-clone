import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const prisma = new PrismaClient();

// A short, royalty-free demo written in alphaTab's AlphaTex format so the app
// has something playable out of the box. Two tracks let you try mute/solo.
const DEMO_ALPHATEX = `\\title "Demo Riff"
\\subtitle "TabPlayer"
\\tempo 100
.
\\track "Rhythm Guitar"
\\instrument 30
\\tuning E4 B3 G3 D3 A2 E2
:8 0.6 0.6 3.6 3.6 5.6 5.6 3.6 3.6 |
0.6 0.6 3.6 3.6 5.6 5.6 3.6 3.6 |
:8 0.5 0.5 3.5 3.5 5.5 5.5 3.5 3.5 |
:4 0.6 0.6 3.6 5.6 |
\\track "Lead Guitar"
\\instrument 27
\\tuning E4 B3 G3 D3 A2 E2
:4 r r r r |
r r r r |
:8 12.1 15.1 12.1 15.1 12.1 14.1 12.1 14.1 |
:4 15.1 12.1 { d } 0.6 |`;

const DEMO_FILE = "tabs/demo-riff.alphatab";

async function main() {
  const storageRoot = join(process.cwd(), "storage");
  await mkdir(join(storageRoot, "tabs"), { recursive: true });
  await writeFile(join(storageRoot, DEMO_FILE), DEMO_ALPHATEX, "utf8");

  const existing = await prisma.song.findFirst({ where: { title: "Demo Riff" } });
  if (existing) {
    console.log("[seed] Demo Riff already present, skipping.");
    return;
  }

  await prisma.song.create({
    data: {
      title: "Demo Riff",
      artist: "TabPlayer",
      genre: "Demo",
      difficulty: "beginner",
      tuning: "Standard",
      filePath: DEMO_FILE,
      fileFormat: "alphatab",
    },
  });
  console.log("[seed] Created Demo Riff.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
