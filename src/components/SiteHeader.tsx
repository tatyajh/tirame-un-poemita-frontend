"use client";

import Link from "next/link";

export default function SiteHeader() {
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
          <Link href="/agregar" className="hover:text-ink-red transition-colors">
            agregar
          </Link>
        </nav>
      </div>
    </header>
  );
}
