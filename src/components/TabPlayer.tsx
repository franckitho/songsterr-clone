"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALPHATAB_FONT_DIR,
  ALPHATAB_SCRIPT_FILE,
  DEFAULT_SOUNDFONT,
  loadAlphaTab,
  toAbsolute,
} from "@/lib/alphatab-loader";

type TrackState = {
  index: number;
  name: string;
  mute: boolean;
  solo: boolean;
  volume: number; // 0..1.5, 1 = 100%
};

type Layout = "page" | "horizontal";
type Stave = "scoretab" | "tab" | "score";

function fmt(ms: number): string {
  if (!isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TabPlayer({
  fileUrl,
  soundFontUrl,
}: {
  fileUrl: string;
  soundFontUrl?: string | null;
}) {
  const mainRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [soundFontReady, setSoundFontReady] = useState(false);
  const [tracks, setTracks] = useState<TrackState[]>([]);
  const [activeTrack, setActiveTrack] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState({ current: 0, total: 0 });
  const [speed, setSpeed] = useState(1);
  const [looping, setLooping] = useState(false);
  const [metronome, setMetronome] = useState(false);
  const [countIn, setCountIn] = useState(false);
  const [layout, setLayout] = useState<Layout>("page");
  const [stave, setStave] = useState<Stave>("scoretab");
  const [zoom, setZoom] = useState(1);

  // ---- init alphaTab ----
  useEffect(() => {
    let disposed = false;
    let api: any = null;

    loadAlphaTab()
      .then((alphaTab) => {
        if (disposed || !mainRef.current) return;
        api = new alphaTab.AlphaTabApi(mainRef.current, {
          core: {
            scriptFile: ALPHATAB_SCRIPT_FILE(),
            fontDirectory: ALPHATAB_FONT_DIR(),
            file: toAbsolute(fileUrl),
          },
          display: {
            layoutMode: "page",
            staveProfile: "scoretab",
          },
          player: {
            enablePlayer: true,
            enableCursor: true,
            enableUserInteraction: true,
            soundFont: soundFontUrl ? toAbsolute(soundFontUrl) : DEFAULT_SOUNDFONT(),
            scrollElement: viewportRef.current!,
            scrollMode: "continuous",
          },
        });
        apiRef.current = api;

        api.scoreLoaded.on((score: any) => {
          const list: TrackState[] = score.tracks.map((t: any) => ({
            index: t.index,
            name: t.name || t.shortName || `Piste ${t.index + 1}`,
            mute: false,
            solo: false,
            volume: 1,
          }));
          setTracks(list);
          setActiveTrack(0);
          setStatus("ready");
        });

        api.renderStarted.on(() => {
          // keep status ready
        });

        api.soundFontLoaded.on(() => setSoundFontReady(true));

        api.playerStateChanged.on((e: any) => {
          setPlaying(e.state === 1 /* Playing */);
        });

        api.playerPositionChanged.on((e: any) => {
          setPos({ current: e.currentTime, total: e.endTime });
        });

        api.error?.on?.((err: any) => {
          setStatus("error");
          setErrorMsg(String(err?.message ?? err ?? "Erreur alphaTab"));
        });
      })
      .catch((err) => {
        if (disposed) return;
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Erreur de chargement");
      });

    return () => {
      disposed = true;
      try {
        api?.destroy?.();
      } catch {
        /* noop */
      }
      apiRef.current = null;
    };
  }, [fileUrl, soundFontUrl]);

  // ---- keyboard: space = play/pause ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target as HTMLElement)?.matches?.("input,select,textarea")) {
        e.preventDefault();
        apiRef.current?.playPause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const applyDisplay = useCallback((next: { layout?: Layout; stave?: Stave; zoom?: number }) => {
    const api = apiRef.current;
    if (!api) return;
    if (next.layout) api.settings.display.layoutMode = next.layout === "page" ? 0 : 1;
    if (next.stave) {
      api.settings.display.staveProfile =
        next.stave === "scoretab" ? 1 : next.stave === "tab" ? 3 : 2;
    }
    if (typeof next.zoom === "number") api.settings.display.scale = next.zoom;
    api.updateSettings();
    api.render();
  }, []);

  // ---- track helpers ----
  const trackObj = (index: number) => apiRef.current?.score?.tracks?.[index];

  const toggleMute = (index: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.index !== index) return t;
        const mute = !t.mute;
        apiRef.current?.changeTrackMute([trackObj(index)], mute);
        return { ...t, mute };
      }),
    );
  };

  const toggleSolo = (index: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.index !== index) return t;
        const solo = !t.solo;
        apiRef.current?.changeTrackSolo([trackObj(index)], solo);
        return { ...t, solo };
      }),
    );
  };

  const setTrackVolume = (index: number, volume: number) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.index !== index) return t;
        apiRef.current?.changeTrackVolume([trackObj(index)], volume);
        return { ...t, volume };
      }),
    );
  };

  const showTrack = (index: number) => {
    const api = apiRef.current;
    const t = trackObj(index);
    if (api && t) {
      api.renderTracks([t]);
      setActiveTrack(index);
    }
  };

  // ---- transport ----
  const playPause = () => apiRef.current?.playPause();
  const stop = () => apiRef.current?.stop();

  const changeSpeed = (v: number) => {
    setSpeed(v);
    if (apiRef.current) apiRef.current.playbackSpeed = v;
  };
  const toggleLoop = () => {
    const v = !looping;
    setLooping(v);
    if (apiRef.current) apiRef.current.isLooping = v;
  };
  const toggleMetronome = () => {
    const v = !metronome;
    setMetronome(v);
    if (apiRef.current) apiRef.current.metronomeVolume = v ? 1 : 0;
  };
  const toggleCountIn = () => {
    const v = !countIn;
    setCountIn(v);
    if (apiRef.current) apiRef.current.countInVolume = v ? 1 : 0;
  };

  const progress = pos.total > 0 ? (pos.current / pos.total) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Transport bar */}
      <div className="border-b border-border bg-surface px-3 py-2 flex flex-wrap items-center gap-2 sticky top-14 z-20">
        <button
          onClick={playPause}
          disabled={status !== "ready"}
          className="w-10 h-10 rounded-full bg-accent text-black grid place-items-center hover:bg-accent-strong disabled:opacity-40 transition text-lg"
          title="Lecture / Pause (Espace)"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          onClick={stop}
          disabled={status !== "ready"}
          className="w-9 h-9 rounded-full bg-surface-2 border border-border grid place-items-center hover:text-accent disabled:opacity-40"
          title="Stop"
        >
          ■
        </button>

        <div className="text-xs tabular-nums text-muted w-24 text-center">
          {fmt(pos.current)} / {fmt(pos.total)}
        </div>

        <div className="flex-1 min-w-[120px] h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
        </div>

        <Control label="Vitesse">
          <select
            value={speed}
            onChange={(e) => changeSpeed(Number(e.target.value))}
            className={selectCls}
          >
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </Control>

        <Toggle active={looping} onClick={toggleLoop} title="Boucle">
          ↻
        </Toggle>
        <Toggle active={metronome} onClick={toggleMetronome} title="Métronome">
          🎵
        </Toggle>
        <Toggle active={countIn} onClick={toggleCountIn} title="Décompte">
          1234
        </Toggle>

        <Control label="Vue">
          <select
            value={layout}
            onChange={(e) => {
              const v = e.target.value as Layout;
              setLayout(v);
              applyDisplay({ layout: v });
            }}
            className={selectCls}
          >
            <option value="page">Page</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </Control>

        <Control label="Notation">
          <select
            value={stave}
            onChange={(e) => {
              const v = e.target.value as Stave;
              setStave(v);
              applyDisplay({ stave: v });
            }}
            className={selectCls}
          >
            <option value="scoretab">Partition + Tab</option>
            <option value="tab">Tablature</option>
            <option value="score">Partition</option>
          </select>
        </Control>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const z = Math.max(0.5, Math.round((zoom - 0.25) * 100) / 100);
              setZoom(z);
              applyDisplay({ zoom: z });
            }}
            className="w-7 h-7 rounded bg-surface-2 border border-border hover:text-accent"
            title="Dézoomer"
          >
            −
          </button>
          <span className="text-xs text-muted w-10 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => {
              const z = Math.min(2, Math.round((zoom + 0.25) * 100) / 100);
              setZoom(z);
              applyDisplay({ zoom: z });
            }}
            className="w-7 h-7 rounded bg-surface-2 border border-border hover:text-accent"
            title="Zoomer"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Track list */}
        <aside className="w-52 shrink-0 border-r border-border bg-surface overflow-y-auto scrollbar-thin">
          <div className="px-3 py-2 text-xs uppercase tracking-wide text-muted">Pistes</div>
          {tracks.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted">Chargement…</div>
          )}
          {tracks.map((t) => (
            <div
              key={t.index}
              className={`px-2 py-2 border-b border-border/50 ${
                activeTrack === t.index ? "bg-surface-2" : ""
              }`}
            >
              <button
                onClick={() => showTrack(t.index)}
                className={`block w-full text-left text-sm truncate mb-1 ${
                  activeTrack === t.index ? "text-accent font-medium" : "hover:text-foreground"
                }`}
                title="Afficher la tablature de cette piste"
              >
                {t.name}
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleMute(t.index)}
                  className={`text-[11px] w-6 h-6 rounded border ${
                    t.mute
                      ? "bg-danger/20 border-danger text-danger"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                  title="Muet"
                >
                  M
                </button>
                <button
                  onClick={() => toggleSolo(t.index)}
                  className={`text-[11px] w-6 h-6 rounded border ${
                    t.solo
                      ? "bg-accent/20 border-accent text-accent"
                      : "border-border text-muted hover:text-foreground"
                  }`}
                  title="Solo"
                >
                  S
                </button>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.05}
                  value={t.volume}
                  onChange={(e) => setTrackVolume(t.index, Number(e.target.value))}
                  className="flex-1 accent-[var(--color-accent)]"
                  title="Volume"
                />
              </div>
            </div>
          ))}
        </aside>

        {/* Notation viewport */}
        <div
          ref={viewportRef}
          className="flex-1 overflow-auto scrollbar-thin bg-neutral-100"
        >
          {status === "error" ? (
            <div className="p-8 text-danger text-sm">
              Impossible de charger la tablature : {errorMsg}
            </div>
          ) : (
            <div ref={mainRef} className="at-surface min-h-full" />
          )}
          {status === "loading" && (
            <div className="p-8 text-neutral-500 text-sm">Chargement de la tablature…</div>
          )}
        </div>
      </div>

      {!soundFontReady && status === "ready" && (
        <div className="px-3 py-1 text-[11px] text-muted bg-surface border-t border-border">
          Préparation du son…
        </div>
      )}
    </div>
  );
}

const selectCls =
  "rounded bg-surface-2 border border-border px-1.5 py-1 text-xs outline-none focus:border-accent";

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1 text-xs text-muted">
      <span className="hidden lg:inline">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-8 px-2 rounded border text-xs ${
        active
          ? "bg-accent/20 border-accent text-accent"
          : "bg-surface-2 border-border text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
