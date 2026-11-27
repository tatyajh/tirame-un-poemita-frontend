"use client";

import { useEffect, useState } from "react";
import TypewriterAudioPlayer from "@/components/TypewriterAudioPlayer";
import { audioUrlFor, getAudioDePoema, SinLecturaError } from "@/lib/api";

// One voice only: "Edgar guiado" (a narrator's reading turned into Edgar's
// voice). The readings are made ahead of time, so the player loads with the
// page and is ready to play; nothing is synthesized while someone listens.
const LECTURA = "guia";
const NARRADOR = "Edgar Augusto Jaramillo Muñoz";
const MUSICA_KEY = "tirame-musica";

function musicaGuardada(): boolean {
  try {
    return window.localStorage.getItem(MUSICA_KEY) !== "no";
  } catch {
    return true;
  }
}

type Resultado =
  | { key: string; estado: "lista"; audioUrl: string; conMusica: boolean }
  | { key: string; estado: "sin_lectura" }
  | { key: string; estado: "error" };

function IconoMusica({ encendida }: { encendida: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={encendida ? "text-ink-red" : "text-ink-soft"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" fill={encendida ? "currentColor" : "none"} />
      <circle cx="17" cy="16" r="3" fill={encendida ? "currentColor" : "none"} />
      {!encendida && <path d="M3 3l18 18" />}
    </svg>
  );
}

export default function PoemPlayerSection({ poemId }: { poemId: number }) {
  const [attempt, setAttempt] = useState(0);
  const [musica, setMusica] = useState<boolean>(musicaGuardada);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const key = `${poemId}:${musica}:${attempt}`;

  function alternarMusica() {
    const value = !musica;
    setMusica(value);
    try {
      window.localStorage.setItem(MUSICA_KEY, value ? "si" : "no");
    } catch {
      // storage unavailable: not remembered
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    getAudioDePoema(poemId, musica, controller.signal, LECTURA)
      .then((audio) =>
        setResultado({
          key,
          estado: "lista",
          audioUrl: audioUrlFor(audio.audio_url),
          conMusica: audio.with_music,
        }),
      )
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResultado({ key, estado: err instanceof SinLecturaError ? "sin_lectura" : "error" });
      });
    return () => controller.abort();
  }, [poemId, musica, key]);

  const actual = resultado?.key === key ? resultado : null;

  const interruptorMusica = (
    <div className="mb-3">
      <button
        type="button"
        role="switch"
        aria-checked={musica}
        aria-label={musica ? "Música encendida" : "Música apagada"}
        title={musica ? "Apagar la música" : "Encender la música"}
        onClick={alternarMusica}
        className="inline-flex items-center gap-2 group"
      >
        <IconoMusica encendida={musica} />
        <span
          aria-hidden="true"
          className={`relative inline-block h-5 w-9 rounded-full border transition-colors ${
            musica ? "bg-ink-red border-ink-red" : "bg-transparent border-ink/30"
          }`}
        >
          <span
            className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-all ${
              musica ? "left-[18px] bg-paper" : "left-[2px] bg-ink/40"
            }`}
          />
        </span>
      </button>
      {musica && actual?.estado === "lista" && !actual.conMusica && (
        <p className="mt-1 font-mono-poem text-[11px] text-ink-soft">
          este poema todavía no tiene música: suena solo la voz.
        </p>
      )}
    </div>
  );

  if (actual?.estado === "sin_lectura") {
    return (
      <p className="font-mono-poem text-sm text-ink-soft border border-ink/15 px-4 py-3">
        Este poema todavía no tiene lectura en voz alta.
      </p>
    );
  }

  if (actual?.estado === "error") {
    return (
      <div className="font-mono-poem text-ink-red border border-ink-red/40 px-4 py-3">
        <p>No se pudo cargar la lectura de este poema.</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-2 border border-ink-red/60 px-3 py-1 text-sm hover:bg-ink-red hover:text-paper transition-colors"
        >
          intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div>
      {interruptorMusica}
      {actual?.estado === "lista" ? (
        <TypewriterAudioPlayer src={actual.audioUrl} narrador={NARRADOR} />
      ) : (
        <p role="status" aria-live="polite" className="font-type text-ink-soft animate-pulse">
          cargando la lectura…
        </p>
      )}
    </div>
  );
}
