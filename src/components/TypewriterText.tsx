"use client";

import { useEffect, useRef, useState } from "react";
import { playCarriageReturn, playKeystroke } from "@/lib/typewriterSound";

/** Poems longer than this are typed only the first time they are shown. */
export const LONG_POEM_CHARS = 600;
/** At most one key sound per this many ms (a fast typist, not a buzz). */
const MIN_KEY_SOUND_GAP_MS = 80;
const SEEN_KEY = "tup-vistos";

function wasSeen(id: string | number): boolean {
  try {
    const seen: (string | number)[] = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]");
    return seen.includes(id);
  } catch {
    return false;
  }
}

function markSeen(id: string | number) {
  try {
    const seen: (string | number)[] = JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]");
    if (!seen.includes(id)) {
      seen.push(id);
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-500)));
    }
  } catch {
    // storage unavailable: the poem is typed again next time
  }
}

interface TypewriterTextProps {
  text: string;
  className?: string;
  /** ms between characters */
  speed?: number;
  /** play typewriter sounds while typing */
  sound?: boolean;
  /** restart the reveal whenever `text` changes */
  resetKey?: string | number;
  /** Poem id: a long poem already seen shows at once instead of being typed. */
  seenId?: string | number;
  onDone?: () => void;
}

export default function TypewriterText({
  text,
  className,
  speed = 22,
  sound = true,
  resetKey,
  seenId,
  onDone,
}: TypewriterTextProps) {
  const [shown, setShown] = useState("");
  const [finished, setFinished] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const long = text.length > LONG_POEM_CHARS;
    if (long && seenId !== undefined && wasSeen(seenId)) {
      setShown(text);
      setFinished(true);
      onDone?.();
      return;
    }
    if (seenId !== undefined) markSeen(seenId);

    indexRef.current = 0;
    setShown("");
    setFinished(false);
    let lastSound = 0;

    const interval = setInterval(() => {
      const next = indexRef.current + 1;
      const char = text[indexRef.current];
      indexRef.current = next;
      setShown(text.slice(0, next));

      if (sound && char) {
        const now = performance.now();
        if (char === "\n") {
          // one bell per line break, never two in a row (stanza breaks)
          if (text[next - 2] !== "\n") playCarriageReturn();
          lastSound = now;
        } else if (char.trim() !== "" && now - lastSound >= MIN_KEY_SOUND_GAP_MS * (0.8 + Math.random() * 0.6)) {
          playKeystroke();
          lastSound = now;
        }
      }

      if (next >= text.length) {
        clearInterval(interval);
        setFinished(true);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, resetKey]);

  return (
    <span className={className}>
      {shown.split("").map((char, i) =>
        char === "\n" ? (
          <br key={i} />
        ) : (
          <span key={i} className="tw-char">
            {char}
          </span>
        ),
      )}
      {!finished && <span className="tw-caret" aria-hidden />}
    </span>
  );
}
