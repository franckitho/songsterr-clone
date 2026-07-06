// Accepted tab file extensions (Guitar Pro family + MusicXML) understood by alphaTab.
export const TAB_EXTENSIONS = [
  ".gp",
  ".gp3",
  ".gp4",
  ".gp5",
  ".gpx",
  ".gp7",
  ".musicxml",
  ".xml",
  ".mxl",
  ".alphatab",
  ".alphatex",
  ".tex",
] as const;

export const SOUNDFONT_EXTENSIONS = [".sf2", ".sf3"] as const;

export function isTabFile(ext: string): boolean {
  return (TAB_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

export function isSoundfontFile(ext: string): boolean {
  return (SOUNDFONT_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

/** Normalize an extension into the value stored in Song.fileFormat. */
export function fileFormatFromExt(ext: string): string {
  return ext.replace(/^\./, "").toLowerCase();
}

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};
