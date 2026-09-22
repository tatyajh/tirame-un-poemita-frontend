"use client";

import { useEffect, useState } from "react";
import AuthorList from "@/components/AuthorList";
import MachineDown from "@/components/MachineDown";
import { listarAutores, type RespuestaAutores } from "@/lib/api";

export default function AutoresPage() {
  const [data, setData] = useState<RespuestaAutores | null | undefined>(undefined);

  useEffect(() => {
    listarAutores(undefined, 100)
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="page-enter px-6 py-12 max-w-3xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="font-type text-2xl mb-1">el archivo de autores</h1>
        {data && (
          <p className="font-mono-poem text-xs uppercase tracking-wide text-ink-soft">
            {data.total} nombre{data.total === 1 ? "" : "s"} en el fichero
          </p>
        )}
      </div>
      {data === undefined ? null : data ? <AuthorList authors={data.authors} /> : <MachineDown />}
    </div>
  );
}
