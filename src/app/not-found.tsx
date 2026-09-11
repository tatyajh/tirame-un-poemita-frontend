import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <p className="font-type text-5xl text-ink-red stamp-rotate">✕</p>
      <h1 className="font-type text-2xl">esta hoja no está en el archivo</h1>
      <p className="font-mono-poem text-ink-soft max-w-sm">
        Buscamos entre las carpetas y no encontramos ese poema o autor.
      </p>
      <Link
        href="/"
        className="border-2 border-ink px-4 py-2 font-type text-sm hover:bg-ink hover:text-paper transition-colors"
      >
        volver a la máquina
      </Link>
    </div>
  );
}
