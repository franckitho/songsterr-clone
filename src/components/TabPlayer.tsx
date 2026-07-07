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
  const tempoRef = useRef(120);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
  const [countdown, setCountdown] = useState<number | null>(null);
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
            enableAnimatedBeatCursor: true,
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
          const t = Number(score.tempo);
          if (isFinite(t) && t > 0) tempoRef.current = t;
        });

        api.renderStarted.on(() => {
          // keep status ready
        });

        api.soundFontLoaded.on(() => setSoundFontReady(true));

        api.playerStateChanged.on((e: any) => {
          const isPlaying = e.state === 1 /* Playing */;
          setPlaying(isPlaying);
          // If playback pauses/stops during the count-in, drop the overlay.
          if (!isPlaying && countdownTimer.current) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
            setCountdown(null);
          }
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
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
        countdownTimer.current = null;
      }
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

  // ---- count-in ----
  const clearCountdown = useCallback(() => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(null);
  }, []);

  // Show an animated "1 · 2 · 3 · 4" overlay, one number per beat at the
  // score's tempo. Runs alongside alphaTab's audible count-in clicks.
  const runVisualCountdown = useCallback(() => {
    clearCountdown();
    const beatMs = 60000 / (tempoRef.current || 120);
    let n = 1;
    setCountdown(1);
    countdownTimer.current = setInterval(() => {
      n += 1;
      if (n > 4) {
        clearCountdown();
      } else {
        setCountdown(n);
      }
    }, beatMs);
  }, [clearCountdown]);

  // ---- transport ----
  const playPause = () => {
    const api = apiRef.current;
    if (!api) return;
    // Starting from a stopped state with count-in on → show the visual decount.
    if (!playing && countIn) runVisualCountdown();
    api.playPause();
  };

  // Dedicated "1·2·3·4 then play" button: always counts in, even if the
  // count-in preference is off. Restores the preference afterwards.
  const playWithCountIn = () => {
    const api = apiRef.current;
    if (!api || playing) return;
    api.countInVolume = 1;
    runVisualCountdown();
    api.play();
    // count-in only affects the start, so restore the toggle's value once past it.
    setTimeout(() => {
      if (apiRef.current) apiRef.current.countInVolume = countIn ? 1 : 0;
    }, (60000 / (tempoRef.current || 120)) * 4 + 200);
  };

  const stop = () => {
    clearCountdown();
    apiRef.current?.stop();
  };

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
    <div className="flex h-full flex-col">
      {/* Transport bar */}
      <div className="mb-4 flex flex-none flex-wrap items-center gap-3 rounded-[14px] border border-border bg-gradient-to-b from-[#13171e] to-[#101318] px-[15px] py-[11px]">
        <button
          onClick={playPause}
          disabled={status !== "ready"}
          className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_6px_20px_rgba(233,185,73,.35)] transition hover:bg-accent-strong disabled:opacity-40"
          title="Lecture / Pause (Espace)"
        >
          {playing ? (
            <span className="flex gap-[4px]">
              <span className="h-4 w-[5px] rounded-[1px] bg-accent-ink" />
              <span className="h-4 w-[5px] rounded-[1px] bg-accent-ink" />
            </span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
              <polygon points="6,4 16,10 6,16" fill="#0c0e11" />
            </svg>
          )}
        </button>
        <button
          onClick={stop}
          disabled={status !== "ready"}
          className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] border border-border-strong bg-white/[0.03] transition hover:text-accent disabled:opacity-40"
          title="Stop"
        >
          <span className="h-3 w-3 rounded-[2px] bg-[#c9d1dc]" />
        </button>
        <button
          onClick={playWithCountIn}
          disabled={status !== "ready" || playing}
          className="flex h-[38px] flex-none items-center rounded-[10px] border border-border-strong bg-white/[0.03] px-[13px] font-mono text-[12px] font-semibold text-[#c9d1dc] transition hover:text-accent disabled:opacity-40"
          title="Décompte 1·2·3·4 puis lecture"
        >
          1·2·3·4 ▶
        </button>

        <div className="w-[98px] flex-none text-center font-mono text-[13px] text-[#aeb6c2]">
          {fmt(pos.current)} / {fmt(pos.total)}
        </div>

        <div className="h-[6px] min-w-[150px] flex-1 overflow-hidden rounded-[3px] bg-white/[0.08]">
          <div className="h-full rounded-[3px] bg-accent" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            ♪
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
              <option value="horizontal">Défilement</option>
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
              <option value="scoretab">Les deux</option>
              <option value="tab">Tablature</option>
              <option value="score">Standard</option>
            </select>
          </Control>

          <div className="flex items-center overflow-hidden rounded-[9px] border border-border-strong">
            <button
              onClick={() => {
                const z = Math.max(0.5, Math.round((zoom - 0.25) * 100) / 100);
                setZoom(z);
                applyDisplay({ zoom: z });
              }}
              className="h-[30px] w-7 bg-white/[0.04] text-[16px] leading-none text-[#c9d1dc] hover:text-accent"
              title="Dézoomer"
            >
              −
            </button>
            <span className="w-[46px] text-center font-mono text-[12px] text-[#c9d1dc]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => {
                const z = Math.min(2, Math.round((zoom + 0.25) * 100) / 100);
                setZoom(z);
                applyDisplay({ zoom: z });
              }}
              className="h-[30px] w-7 bg-white/[0.04] text-[16px] leading-none text-[#c9d1dc] hover:text-accent"
              title="Zoomer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-start gap-4">
        {/* Track list */}
        <aside className="hidden h-full w-[224px] flex-none flex-col overflow-y-auto rounded-[14px] border border-border bg-surface px-[15px] py-4 scrollbar-thin sm:flex">
          <div className="mb-4 text-[10.5px] font-bold tracking-[0.14em] text-faint">PISTES</div>
          {tracks.length === 0 && <div className="text-[12px] text-muted">Chargement…</div>}
          <div className="flex flex-col gap-[18px]">
            {tracks.map((t) => (
              <div key={t.index}>
                <button
                  onClick={() => showTrack(t.index)}
                  className={`mb-[9px] block w-full truncate text-left text-[13px] font-semibold ${
                    activeTrack === t.index ? "text-accent" : "text-[#e8ebf0] hover:text-foreground"
                  }`}
                  title="Afficher la tablature de cette piste"
                >
                  {t.name}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMute(t.index)}
                    className={`h-7 w-[30px] flex-none rounded-[7px] text-[12px] font-bold ${
                      t.mute ? "bg-accent text-accent-ink" : "bg-white/[0.06] text-muted"
                    }`}
                    title="Muet"
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(t.index)}
                    className={`h-7 w-[30px] flex-none rounded-[7px] text-[12px] font-bold ${
                      t.solo ? "bg-accent/20 text-accent" : "bg-white/[0.06] text-muted"
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
                    className="min-w-0 flex-1 accent-[var(--color-accent)]"
                    title="Volume"
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Notation viewport */}
        <div
          ref={viewportRef}
          className="relative h-full min-w-0 flex-1 overflow-auto rounded-[14px] border border-border bg-panel p-[18px] scrollbar-thin"
        >
          {countdown !== null && (
            <div className="pointer-events-none sticky top-0 left-0 z-30 flex h-0 items-start justify-center">
              <div
                key={countdown}
                className="mt-16 grid h-28 w-28 animate-[countpop_0.5s_ease-out] place-items-center rounded-full bg-playhead text-6xl font-bold text-accent-ink shadow-2xl"
              >
                {countdown}
              </div>
            </div>
          )}
          {status === "error" ? (
            <div className="p-8 text-sm text-danger">
              Impossible de charger la tablature : {errorMsg}
            </div>
          ) : (
            <div
              ref={mainRef}
              className="at-surface min-h-full rounded-[5px] shadow-[0_12px_44px_rgba(0,0,0,.45)]"
            />
          )}
          {status === "loading" && (
            <div className="p-8 text-sm text-neutral-500">Chargement de la tablature…</div>
          )}
        </div>
      </div>

      {!soundFontReady && status === "ready" && (
        <div className="mt-2 flex-none text-[11px] text-muted">Préparation du son…</div>
      )}
    </div>
  );
}

const selectCls =
  "rounded-[8px] bg-white/[0.05] border border-border-strong px-[9px] py-1.5 text-[12.5px] text-[#e8ebf0] cursor-pointer outline-none";

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-[11.5px] text-muted-2">
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
      className={`flex h-[38px] min-w-[38px] items-center justify-center rounded-[10px] px-2 text-[15px] ${
        active
          ? "border border-accent/40 bg-accent/[0.14] text-accent"
          : "border border-border-strong bg-white/[0.03] text-[#c9d1dc] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
