"use client";

import { useEffect, useState } from "react";
import TypewriterAudioPlayer from "@/components/TypewriterAudioPlayer";
import { audioUrlFor, getAudioDePoema, type Lectura } from "@/lib/api";

const OPCIONES: { value: Lectura; label: string; detalle: string }[] = [
  { value: "directa", label: "Voz de Edgar", detalle: "su voz clonada lee el poema" },
  {
    value: "guia",
    label: "Edgar guiado",
    detalle: "un narrador paisa lee y se convierte a su voz",
  },
];
const STORAGE_KEY = "tirame-lectura";

function lecturaGuardada(): Lectura {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "guia" ? "guia" : "directa";
  } catch {
    return "directa";
  }
}

type Resultado =
  | { key: string; audioUrl: string; narrador: string | null; error: false }
  | { key: string; error: true };

export default function PoemPlayerSection({ poemId }: { poemId: number }) {
  const [attempt, setAttempt] = useState(0);
  const [lectura, setLectura] = useState<Lectura>(lecturaGuardada);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [slowKey, setSlowKey] = useState<string | null>(null);
  const key = `${poemId}:${lectura}:${attempt}`;

  function escoger(value: Lectura) {
    setLectura(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // storage unavailable (private mode): the choice just isn't remembered
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    // A poem read for the first time is synthesized on the spot (~20-40 s).
    const slowTimer = setTimeout(() => setSlowKey(key), 4000);

    getAudioDePoema(poemId, false, controller.signal, lectura)
      .then((audio) => {
        setResultado({
          key,
          audioUrl: audioUrlFor(audio.audio_url),
          narrador: audio.narrador,
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
  }, [poemId, lectura, key]);

  const actual = resultado?.key === key ? resultado : null;
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
