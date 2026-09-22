"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MachineDown from "@/components/MachineDown";
import PoemCard from "@/components/PoemCard";
import SearchBar from "@/components/SearchBar";
import { buscarPoemasSemantico, type RespuestaBusqueda } from "@/lib/api";

function BuscarContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [resultados, setResultados] = useState<RespuestaBusqueda | null | undefined>(undefined);

  useEffect(() => {
    if (query.length < 3) {
      setResultados(undefined);
      return;
    }
    buscarPoemasSemantico(query, 12)
      .then(setResultados)
      .catch(() => setResultados(null));
  }, [query]);

  return (
    <div className="page-enter px-6 py-12 max-w-4xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h1 className="font-type text-2xl mb-4">buscar en el archivo</h1>
        <SearchBar initialQuery={query} />
      </div>

      {query.length > 0 && query.length < 3 && (
        <p className="font-mono-poem text-ink-soft">Escribe al menos 3 letras para que la máquina busque.</p>
      )}

      {resultados === null && <MachineDown />}

      {resultados && (
        <div>
          <p className="font-mono-poem text-xs uppercase tracking-wide text-ink-soft mb-4">
            {resultados.total} coincidencia{resultados.total === 1 ? "" : "s"} para “{query}”
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resultados.results.map(({ poem, score }) => (
              <PoemCard key={poem.id} poema={poem} score={score} />
            ))}
          </div>
          {resultados.total === 0 && (
            <p className="font-mono-poem text-ink-soft">
              Ningún verso resonó con eso. Prueba con una palabra distinta.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={null}>
      <BuscarContent />
    </Suspense>
  );
}
