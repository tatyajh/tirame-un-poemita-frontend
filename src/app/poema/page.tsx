"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MachineDown from "@/components/MachineDown";
import PoemPlayerSection from "@/components/PoemPlayerSection";
import TypewriterText from "@/components/TypewriterText";
import { PoemNotFoundError, getPoemaPorId, type Poema } from "@/lib/api";

function PoemaContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const [poema, setPoema] = useState<Poema | null | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setPoema(undefined);
    setNotFound(false);
    getPoemaPorId(id)
      .then(setPoema)
      .catch((err) => {
        if (err instanceof PoemNotFoundError) {
          setNotFound(true);
        } else {
          setPoema(null);
        }
      });
  }, [id]);

  if (!id) {
    return (
      <div className="page-enter px-6 py-12 max-w-3xl mx-auto w-full">
        <p className="font-mono-poem text-ink-soft">No se indicó ningún poema.</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-enter px-6 py-12 max-w-3xl mx-auto w-full">
        <p className="font-mono-poem text-ink-soft">No se encontró ese poema en el archivo.</p>
      </div>
    );
  }

  if (poema === null) {
    return (
      <div className="page-enter px-6 py-12 max-w-3xl mx-auto w-full">
        <MachineDown />
      </div>
    );
  }

  if (poema === undefined) return null;

  return (
    <div className="page-enter px-6 py-12 max-w-3xl mx-auto w-full flex flex-col gap-8">
      <div>
        {poema.autor && (
          <Link
            href={`/autor?nombre=${encodeURIComponent(poema.autor.nombre)}`}
            className="font-mono-poem text-xs uppercase tracking-wide text-ink-soft hover:text-ink-red transition-colors"
          >
            {poema.autor.nombre}
          </Link>
        )}
        <h1 className="font-type text-2xl sm:text-3xl mt-1">{poema.titulo}</h1>
      </div>

      <TypewriterText
        text={poema.contenido}
        speed={10}
        sound={false}
        className="font-mono-poem text-base sm:text-lg leading-relaxed whitespace-pre-wrap"
      />

      <PoemPlayerSection poemId={poema.id} />
    </div>
  );
}

export default function PoemaPage() {
  return (
    <Suspense fallback={null}>
      <PoemaContent />
    </Suspense>
  );
}
