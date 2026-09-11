import { notFound } from "next/navigation";
import MachineDown from "@/components/MachineDown";
import PoemCard from "@/components/PoemCard";
import { PoemNotFoundError, buscarPorAutor } from "@/lib/api";

export default async function AutorPage({
  params,
}: {
  params: Promise<{ nombre: string }>;
}) {
  const { nombre } = await params;
  const autor = decodeURIComponent(nombre);

  let resultados;
  try {
    resultados = await buscarPorAutor(autor, 30);
  } catch (err) {
    if (err instanceof PoemNotFoundError) {
      notFound();
    }
    return (
      <div className="page-enter px-6 py-12 max-w-4xl mx-auto w-full">
        <MachineDown />
      </div>
    );
  }

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
