"use client";

import { useEffect, useRef, useState } from "react";
import { playCarriageReturn, playKeystroke } from "@/lib/typewriterSound";

interface TypewriterTextProps {
  text: string;
  className?: string;
  /** ms between characters */
  speed?: number;
  /** play synthesized key sounds while typing */
  sound?: boolean;
  /** restart the reveal whenever `text` changes */
  resetKey?: string | number;
  onDone?: () => void;
}

export default function TypewriterText({
  text,
  className,
  speed = 22,
  sound = true,
  resetKey,
  onDone,
}: TypewriterTextProps) {
  const [shown, setShown] = useState("");
  const [finished, setFinished] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setShown("");
    setFinished(false);

    const interval = setInterval(() => {
      const next = indexRef.current + 1;
      const char = text[indexRef.current];
      indexRef.current = next;
      setShown(text.slice(0, next));

      if (sound && char) {
        if (char === "\n") playCarriageReturn();
        else if (char.trim() !== "") playKeystroke();
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
