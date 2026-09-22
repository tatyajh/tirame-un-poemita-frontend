import Link from "next/link";
import type { Autor } from "@/lib/api";

export default function AuthorList({ authors }: { authors: Autor[] }) {
  if (authors.length === 0) {
    return <p className="font-mono-poem text-ink-soft">Ningún nombre en el archivo todavía.</p>;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
      {authors.map((autor) => (
        <li key={autor.id} className="bg-paper">
          <Link
            href={`/autor?nombre=${encodeURIComponent(autor.nombre)}`}
            className="flex items-baseline justify-between gap-3 px-4 py-3 hover:bg-ink-red/10 transition-colors"
          >
            <span className="font-type">{autor.nombre}</span>
            <span className="font-mono-poem text-[11px] text-ink-soft">
              {[autor.epoca, autor.nacionalidad].filter(Boolean).join(" · ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
