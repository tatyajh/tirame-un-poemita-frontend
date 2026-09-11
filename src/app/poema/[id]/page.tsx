import Link from "next/link";
import { notFound } from "next/navigation";
import MachineDown from "@/components/MachineDown";
import PoemPlayerSection from "@/components/PoemPlayerSection";
import TypewriterText from "@/components/TypewriterText";
import { PoemNotFoundError, getPoemaPorId } from "@/lib/api";

export default async function PoemaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let poema;
  try {
    poema = await getPoemaPorId(id);
  } catch (err) {
    if (err instanceof PoemNotFoundError) notFound();
    return (
      <div className="page-enter px-6 py-12 max-w-3xl mx-auto w-full">
        <MachineDown />
      </div>
    );
  }

  return (
    <div className="page-enter px-6 py-12 max-w-3xl mx-auto w-full flex flex-col gap-8">
      <div>
        {poema.autor && (
          <Link
            href={`/autor/${encodeURIComponent(poema.autor.nombre)}`}
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
