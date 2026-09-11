"use client";

import { useEffect, useState } from "react";
import TypewriterAudioPlayer from "@/components/TypewriterAudioPlayer";
import { audioUrlFor, getAudioDePoema } from "@/lib/api";

export default function PoemPlayerSection({ poemId }: { poemId: number }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [narrador, setNarrador] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAudioUrl(null);
    setError(false);

    getAudioDePoema(poemId)
      .then((audio) => {
        if (cancelled) return;
        setAudioUrl(audioUrlFor(audio.audio_url));
        setNarrador(audio.narrador);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [poemId]);

  if (error) {
    return (
      <p className="font-mono-poem text-ink-red border border-ink-red/40 px-4 py-3">
        La cinta se rompió al grabar este poema. Intenta de nuevo en un momento.
      </p>
    );
  }

  if (!audioUrl) {
    return (
      <p className="font-type text-ink-soft animate-pulse">
        grabando la voz sobre la cinta…
      </p>
    );
  }

  return <TypewriterAudioPlayer src={audioUrl} narrador={narrador} />;
}
