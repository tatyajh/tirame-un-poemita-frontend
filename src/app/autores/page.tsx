import AuthorList from "@/components/AuthorList";
import MachineDown from "@/components/MachineDown";
import { listarAutores } from "@/lib/api";

export default async function AutoresPage() {
  const data = await listarAutores(undefined, 100).catch(() => null);

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
      {data ? <AuthorList authors={data.authors} /> : <MachineDown />}
    </div>
  );
}
