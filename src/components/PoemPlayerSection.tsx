"use client";

import { useEffect, useState } from "react";
import TypewriterAudioPlayer from "@/components/TypewriterAudioPlayer";
import { audioUrlFor, getAudioDePoema, type Lectura } from "@/lib/api";

// "guia" (Voice Changer) is the default reading.
const OPCIONES: { value: Lectura; label: string; detalle: string }[] = [
  {
    value: "guia",
    label: "Edgar guiado",
    detalle: "un narrador paisa lee y se convierte a su voz",
  },
  { value: "directa", label: "Voz de Edgar", detalle: "su voz clonada lee el poema" },
];
// v2: the default changed to "guia", so earlier saved choices start over.
const STORAGE_KEY = "tirame-lectura-v2";
const MUSICA_KEY = "tirame-musica";

function musicaGuardada(): boolean {
  try {
    return window.localStorage.getItem(MUSICA_KEY) !== "no";
  } catch {
    return true;
  }
}

function lecturaGuardada(): Lectura {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "directa" ? "directa" : "guia";
  } catch {
    return "guia";
  }
}

type Resultado =
  | { key: string; audioUrl: string; narrador: string | null; conMusica: boolean; error: false }
  | { key: string; error: true };

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
  const [lectura, setLectura] = useState<Lectura>(lecturaGuardada);
  const [musica, setMusica] = useState<boolean>(musicaGuardada);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [slowKey, setSlowKey] = useState<string | null>(null);
  const key = `${poemId}:${lectura}:${musica}:${attempt}`;

  function escoger(value: Lectura) {
    setLectura(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // storage unavailable (private mode): the choice just isn't remembered
    }
  }

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
    // A poem read for the first time is synthesized on the spot (~20-40 s).
    const slowTimer = setTimeout(() => setSlowKey(key), 4000);

    getAudioDePoema(poemId, musica, controller.signal, lectura)
      .then((audio) => {
        setResultado({
          key,
          audioUrl: audioUrlFor(audio.audio_url),
          narrador: audio.narrador,
          conMusica: audio.with_music,
          error: false,
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setResultado({ key, error: true });
      })
      .finally(() => clearTimeout(slowTimer));

    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [poemId, lectura, musica, key]);

  const actual = resultado?.key === key ? resultado : null;
  const actualListo = actual && !actual.error ? actual : null;
  const opcion = OPCIONES.find((o) => o.value === lectura) ?? OPCIONES[0];

  const selector = (
    <div className="mb-3" role="radiogroup" aria-label="Voz de la lectura">
      <div className="flex flex-wrap gap-2 font-mono-poem text-xs">
        {OPCIONES.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={lectura === o.value}
            onClick={() => escoger(o.value)}
            className={`px-3 py-1 border uppercase tracking-wide transition-colors ${
              lectura === o.value
                ? "border-ink-red text-ink-red"
                : "border-ink/20 text-ink-soft hover:border-ink/40"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-1 font-mono-poem text-[11px] text-ink-soft">{opcion.detalle}</p>
      <button
        type="button"
        role="switch"
        aria-checked={musica}
        aria-label={musica ? "Música encendida" : "Música apagada"}
        title={musica ? "Apagar la música" : "Encender la música"}
        onClick={alternarMusica}
        className="mt-3 inline-flex items-center gap-2 group"
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
      {musica && actualListo && !actualListo.conMusica && (
        <p className="mt-1 font-mono-poem text-[11px] text-ink-soft">
          este poema todavía no tiene música: suena solo la voz.
        </p>
      )}
    </div>
  );

  if (actual?.error) {
    return (
      <div>
        {selector}
        <div className="font-mono-poem text-ink-red border border-ink-red/40 px-4 py-3">
          <p>La cinta se rompió al grabar este poema. Intenta de nuevo en un momento.</p>
          <button
            type="button"
            onClick={() => setAttempt((n) => n + 1)}
            className="mt-2 border border-ink-red/60 px-3 py-1 text-sm hover:bg-ink-red hover:text-paper transition-colors"
          >
            volver a grabar
          </button>
        </div>
      </div>
    );
  }

  if (!actual) {
    return (
      <div>
        {selector}
        <div role="status" aria-live="polite" className="font-type text-ink-soft">
          <p className="animate-pulse">grabando la voz sobre la cinta…</p>
          {slowKey === key && (
            <p className="mt-1 font-mono-poem text-xs">
              es la primera vez que se lee este poema con esta voz: tarda unos segundos en
              grabarse.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {selector}
      <TypewriterAudioPlayer src={actual.audioUrl} narrador={actual.narrador ?? opcion.label} />
    </div>
  );
}
