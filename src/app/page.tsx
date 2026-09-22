"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import TypewriterText from "@/components/TypewriterText";
import { getPoemaAleatorio, type Poema } from "@/lib/api";

export default function Home() {
  const [poema, setPoema] = useState<Poema | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setPoema(null);
    getPoemaAleatorio()
      .then((p) => {
        if (!cancelled) setPoema(p);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  return (
    <div className="page-enter flex flex-col items-center px-6 py-12 sm:py-20 gap-14">
      <div className="max-w-2xl w-full text-center">
        <p className="font-mono-poem text-xs uppercase tracking-[0.3em] text-ink-soft mb-3">
          hoja en blanco Nº {poema?.id ?? "···"}
        </p>

        <div className="min-h-[220px] border border-ink/20 bg-paper-deep/30 px-6 py-8 sm:px-10 sm:py-12 text-left">
          {error && (
            <p className="font-mono-poem text-ink-red">
              La máquina se atascó. ¿Sigue corriendo el backend en {"{NEXT_PUBLIC_API_URL}"}?
            </p>
          )}
          {!error && !poema && (
            <p className="font-type text-ink-soft animate-pulse">cargando el carrete…</p>
          )}
          {poema && (
            <>
              <h1 className="font-type text-xl sm:text-2xl mb-1">{poema.titulo}</h1>
              {poema.autor && (
                <p className="font-mono-poem text-xs uppercase tracking-wide text-ink-soft mb-6">
                  {poema.autor.nombre}
                </p>
              )}
              <TypewriterText
                key={poema.id}
                text={poema.contenido}
                speed={16}
                className="font-mono-poem text-base sm:text-lg leading-relaxed whitespace-pre-wrap"
              />
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setTick((t) => t + 1)}
            className="border-2 border-ink px-4 py-2 font-type text-sm hover:bg-ink hover:text-paper transition-colors"
          >
            ↻ otra hoja
          </button>
          {poema && (
            <Link
              href={`/poema?id=${poema.id}`}
              className="border-2 border-ink-red text-ink-red px-4 py-2 font-type text-sm hover:bg-ink-red hover:text-paper transition-colors"
            >
              escuchar este poema →
            </Link>
          )}
        </div>
      </div>

      <SearchBar />
    </div>
  );
}
