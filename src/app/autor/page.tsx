"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MachineDown from "@/components/MachineDown";
import PoemCard from "@/components/PoemCard";
import { PoemNotFoundError, buscarPorAutor, type RespuestaBusqueda } from "@/lib/api";

function AutorContent() {
  const searchParams = useSearchParams();
  const autor = decodeURIComponent(searchParams.get("nombre") ?? "");
  const [resultados, setResultados] = useState<RespuestaBusqueda | null | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!autor) return;
    setResultados(undefined);
    setNotFound(false);
    buscarPorAutor(autor, 30)
      .then(setResultados)
      .catch((err) => {
        if (err instanceof PoemNotFoundError) {
          setNotFound(true);
        } else {
          setResultados(null);
        }
      });
  }, [autor]);

  if (!autor) {
    return (
      <div className="page-enter px-6 py-12 max-w-4xl mx-auto w-full">
        <p className="font-mono-poem text-ink-soft">No se indicó ningún autor.</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-enter px-6 py-12 max-w-4xl mx-auto w-full">
        <p className="font-mono-poem text-ink-soft">No se encontró ese autor en el archivo.</p>
      </div>
    );
  }

  if (resultados === null) {
    return (
      <div className="page-enter px-6 py-12 max-w-4xl mx-auto w-full">
        <MachineDown />
      </div>
    );
  }

  if (resultados === undefined) return null;

  return (
    <div className="page-enter px-6 py-12 max-w-4xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="font-type text-2xl mb-1">{autor}</h1>
        <p className="font-mono-poem text-xs uppercase tracking-wide text-ink-soft">
          {resultados.total} poema{resultados.total === 1 ? "" : "s"} en el archivo
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {resultados.results.map(({ poem }) => (
          <PoemCard key={poem.id} poema={poem} />
        ))}
      </div>
    </div>
  );
}

export default function AutorPage() {
  return (
    <Suspense fallback={null}>
      <AutorContent />
    </Suspense>
  );
}
