"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/typewriterSound";

export default function SiteHeader() {
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  }

  return (
    <header className="border-b border-ink/15 px-6 py-5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="group">
          <span className="font-type text-lg sm:text-xl tracking-tight">
            Tírame un <span className="text-ink-red underline-ink">Poemita</span>
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-mono-poem">
          <Link href="/autores" className="hover:text-ink-red transition-colors">
            autores
          </Link>
          <Link href="/buscar" className="hover:text-ink-red transition-colors">
            buscar
          </Link>
          <button
            type="button"
            onClick={toggleSound}
            title={soundOn ? "Silenciar máquina" : "Encender sonido de máquina"}
            className="border border-ink/30 px-2 py-1 text-xs uppercase tracking-wide hover:border-ink-red hover:text-ink-red transition-colors"
          >
            {soundOn ? "◉ sonido" : "○ mudo"}
          </button>
        </nav>
      </div>
    </header>
  );
}
