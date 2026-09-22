import Link from "next/link";
import type { Poema } from "@/lib/api";

export default function PoemCard({ poema, score }: { poema: Poema; score?: number }) {
  const snippet = poema.contenido.slice(0, 140).trim();

  return (
    <Link
      href={`/poema?id=${poema.id}`}
      className="group block border border-ink/25 bg-paper-deep/40 p-5 transition-all hover:-translate-y-0.5 hover:border-ink-red hover:shadow-[4px_4px_0_var(--ink)]"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-type text-lg leading-snug group-hover:text-ink-red transition-colors">
          {poema.titulo}
        </h3>
        {typeof score === "number" && (
          <span className="shrink-0 font-mono-poem text-[10px] text-ink-soft border border-ink/20 px-1.5 py-0.5">
            {Math.round(score * 100)}%
          </span>
        )}
      </div>
      {poema.autor && (
        <p className="mt-1 font-mono-poem text-xs uppercase tracking-wide text-ink-soft">
          {poema.autor.nombre}
        </p>
      )}
      <p className="mt-3 font-mono-poem text-sm text-ink-soft leading-relaxed">
        {snippet}
        {poema.contenido.length > 140 ? "…" : ""}
      </p>
    </Link>
  );
}
