"use client";

import { useEffect, useRef, useState } from "react";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function TypewriterAudioPlayer({
  src,
  narrador,
}: {
  src: string;
  narrador?: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    const onEnd = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("canplay", () => setLoading(false));

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrent(value);
  }

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <div className="border-2 border-ink bg-paper-deep/60 p-4 sm:p-5">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          disabled={loading}
          aria-label={playing ? "Pausar" : "Reproducir"}
          className="shrink-0 h-12 w-12 grid place-items-center border-2 border-ink bg-paper hover:bg-ink hover:text-paper transition-colors disabled:opacity-40"
        >
          <span className="font-type text-lg">{playing ? "❙❙" : "▶"}</span>
        </button>

        <svg
          viewBox="0 0 24 24"
          className={`h-9 w-9 shrink-0 spool-spin text-ink-soft`}
          data-paused={String(!playing)}
          fill="none"
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="2.6" fill="currentColor" />
        </svg>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between font-mono-poem text-[11px] text-ink-soft mb-1">
            <span>{narrador ? `voz: ${narrador}` : "voz sintetizada"}</span>
            <span>
              {formatTime(current)} / {formatTime(duration)}
            </span>
          </div>
          <div className="relative h-3 border border-ink/40 bg-paper torn-top">
            <div
              className="absolute inset-y-0 left-0 bg-ink-red/70"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={current}
              onChange={seek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Progreso del audio"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
