"use client";

import { useEffect, useState } from "react";
import TypewriterAudioPlayer from "@/components/TypewriterAudioPlayer";
import { audioUrlFor, getAudioDePoema } from "@/lib/api";

type Resultado =
  | { key: string; audioUrl: string; narrador: string | null; error: false }
  | { key: string; error: true };

export default function PoemPlayerSection({ poemId }: { poemId: number }) {
  const [attempt, setAttempt] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [slowKey, setSlowKey] = useState<string | null>(null);
  const key = `${poemId}:${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    // A poem read for the first time is synthesized on the spot (~20-40 s).
    const slowTimer = setTimeout(() => setSlowKey(key), 4000);

    getAudioDePoema(poemId, false, controller.signal)
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
  }, [poemId, key]);

  const actual = resultado?.key === key ? resultado : null;

  if (actual?.error) {
    return (
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
    );
  }

  if (!actual) {
    return (
      <div role="status" aria-live="polite" className="font-type text-ink-soft">
        <p className="animate-pulse">grabando la voz sobre la cinta…</p>
        {slowKey === key && (
          <p className="mt-1 font-mono-poem text-xs">
            es la primera vez que se lee este poema: la voz tarda unos segundos en grabarse.
          </p>
        )}
      </div>
    );
  }

  return <TypewriterAudioPlayer src={actual.audioUrl} narrador={actual.narrador} />;
}
