"use client";

// alphaTab ships as a self-contained UMD bundle. We load it from /public via a
// <script> tag so its Web Worker + Audio Worklet resolve against the same URL,
// which sidesteps bundler worker-resolution issues.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    alphaTab?: any;
  }
}

const SCRIPT_URL = "/alphatab/alphaTab.min.js";
let loaderPromise: Promise<any> | null = null;

export function loadAlphaTab(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.alphaTab) return Promise.resolve(window.alphaTab);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_URL}"]`,
    );
    const onLoad = () => {
      if (window.alphaTab) resolve(window.alphaTab);
      else reject(new Error("alphaTab global introuvable après chargement"));
    };
    if (existing) {
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", () => reject(new Error("Échec de chargement d’alphaTab")));
      if (window.alphaTab) resolve(window.alphaTab);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", onLoad);
    script.addEventListener("error", () => reject(new Error("Échec de chargement d’alphaTab")));
    document.head.appendChild(script);
  });

  return loaderPromise;
}

// The alphaTab Web Worker and Audio Worklet resolve these URLs from inside a
// worker context, where root-relative paths are invalid — they must be absolute.
function absolute(path: string): string {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).href;
}

export const ALPHATAB_FONT_DIR = () => absolute("/alphatab/font/");
export const ALPHATAB_SCRIPT_FILE = () => absolute(SCRIPT_URL);
export const DEFAULT_SOUNDFONT = () => absolute("/alphatab/soundfont/sonivox.sf3");

/** Resolve a possibly root-relative soundfont URL to an absolute one. */
export function toAbsolute(path: string): string {
  return absolute(path);
}
