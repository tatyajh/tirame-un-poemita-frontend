"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import TypewriterText from "@/components/TypewriterText";
import {
  getPoemaAleatorio,
  listarSentimientos,
  type Poema,
  type Sentimiento,
  etiquetaSentimientos,
} from "@/lib/api";

export default function Home() {
  const [poema, setPoema] = useState<Poema | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const [sentimientos, setSentimientos] = useState<Sentimiento[]>([]);
  const [sentimiento, setSentimiento] = useState<string | null>(null);

  useEffect(() => {
    listarSentimientos()
      .then((lista) => setSentimientos(lista.filter((s) => s.total > 0)))
      .catch(() => setSentimientos([]));
  }, []);

  function escoger(slug: string | null) {
    setSentimiento(slug);
    setTick((t) => t + 1);
  }

  useEffect(() => {
    let cancelled = false;
    setError(false);
    setPoema(null);
    getPoemaAleatorio({ sentimiento })
      .then((p) => {
        if (!cancelled) setPoema(p);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [tick, sentimiento]);

  return (
    <div className="page-enter flex flex-col items-center px-6 py-12 sm:py-20 gap-14">
      <div className="max-w-2xl w-full text-center">
        <p className="font-mono-poem text-xs uppercase tracking-[0.3em] text-ink-soft mb-3">
          hoja en blanco Nº {poema?.id ?? "···"}
        </p>

        {sentimientos.length > 0 && (
          <div className="mb-4" role="radiogroup" aria-label="Sentimiento del poema">
            <p className="font-mono-poem text-[11px] uppercase tracking-wide text-ink-soft mb-2">
              tírame uno de:
            </p>
            <div className="flex flex-wrap justify-center gap-2 font-mono-poem text-xs">
              {[{ slug: null, nombre: "cualquier sentimiento" }, ...sentimientos].map((s) => (
                <button
                  key={s.slug ?? "todos"}
                  type="button"
                  role="radio"
                  aria-checked={sentimiento === s.slug}
                  onClick={() => escoger(s.slug)}
                  className={`px-2.5 py-1 border transition-colors ${
                    sentimiento === s.slug
                      ? "border-ink-red text-ink-red"
                      : "border-ink/20 text-ink-soft hover:border-ink/40"
                  }`}
                >
                  {s.nombre.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}

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
                <p className="font-mono-poem text-xs uppercase tracking-wide text-ink-soft mb-1">
                  {poema.autor.nombre}
                </p>
              )}
              {etiquetaSentimientos(poema) ? (
                <p className="font-mono-poem text-[11px] text-ink-red/80 mb-6">
                  {etiquetaSentimientos(poema)}
                </p>
              ) : (
                <div className="mb-5" />
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
