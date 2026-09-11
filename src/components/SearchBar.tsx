"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <label className="block text-xs uppercase tracking-[0.25em] text-ink-soft mb-2">
        dicta un sentimiento, la máquina busca el poema
      </label>
      <div className="flex items-stretch border-2 border-ink bg-paper-deep/60">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="soledad, mar, un amor que no vuelve…"
          className="flex-1 bg-transparent px-4 py-3 font-mono-poem text-ink placeholder:text-ink-soft/60 outline-none"
        />
        <button
          type="submit"
          className="px-5 font-type text-sm uppercase tracking-wide bg-ink text-paper hover:bg-ink-red transition-colors"
        >
          teclear
        </button>
      </div>
    </form>
  );
}
