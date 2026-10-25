"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  agregarPoema,
  etiquetaSentimientos,
  listarSentimientos,
  type Poema,
  type Sentimiento,
} from "@/lib/api";

const KEY_STORAGE = "tirame-admin-key";

function claveGuardada(): string {
  try {
    return window.localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

const campo =
  "w-full border border-ink/30 bg-paper px-3 py-2 font-mono-poem text-sm focus:outline-none focus:border-ink-red";
const etiqueta = "block font-mono-poem text-xs uppercase tracking-wide text-ink-soft mb-1";

export default function AgregarPoema() {
  const [sentimientos, setSentimientos] = useState<Sentimiento[]>([]);
  const [clave, setClave] = useState(claveGuardada);
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [nacionalidad, setNacionalidad] = useState("");
  const [sentimiento, setSentimiento] = useState("");
  const [contenido, setContenido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agregado, setAgregado] = useState<Poema | null>(null);

  useEffect(() => {
    listarSentimientos()
      .then(setSentimientos)
      .catch(() => setSentimientos([]));
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAgregado(null);
    setEnviando(true);
    try {
      const poema = await agregarPoema(
        { titulo, autor, nacionalidad, contenido, sentimiento: sentimiento || null },
        clave.trim(),
      );
      try {
        window.localStorage.setItem(KEY_STORAGE, clave.trim());
      } catch {
        // storage unavailable: the key just isn't remembered
      }
      setAgregado(poema);
      setTitulo("");
      setContenido("");
      setSentimiento("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar el poema.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="page-enter px-6 py-12 max-w-2xl mx-auto w-full flex flex-col gap-6">
      <div>
        <h1 className="font-type text-2xl">agregar un poema</h1>
        <p className="font-mono-poem text-xs text-ink-soft mt-1">
          Queda en el archivo, listo para buscarse y escucharse. Si no escoges el sentimiento,
          Claude lo lee y lo clasifica.
        </p>
      </div>

      {agregado && (
        <div role="status" className="border border-ink-red/40 px-4 py-3 font-mono-poem text-sm">
          <p>
            Agregado: <strong>{agregado.titulo}</strong>
            {agregado.autor ? ` — ${agregado.autor.nombre}` : ""}
          </p>
          <p className="text-ink-red mt-1">
            {etiquetaSentimientos(agregado)
              ? `sentimientos: ${etiquetaSentimientos(agregado)}`
              : "sentimiento: pendiente (se clasifica en el próximo reinicio)"}
          </p>
          <Link href={`/poema?id=${agregado.id}`} className="underline mt-2 inline-block">
            ver y escuchar el poema →
          </Link>
        </div>
      )}

      <form onSubmit={enviar} className="flex flex-col gap-4">
        <div>
          <label className={etiqueta} htmlFor="titulo">título</label>
          <input id="titulo" required value={titulo} onChange={(e) => setTitulo(e.target.value)} className={campo} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={etiqueta} htmlFor="autor">autor</label>
            <input
              id="autor"
              required
              minLength={2}
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Edgar Augusto Jaramillo Muñoz"
              className={campo}
            />
          </div>
          <div>
            <label className={etiqueta} htmlFor="nacionalidad">nacionalidad (opcional)</label>
            <input
              id="nacionalidad"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
              className={campo}
            />
          </div>
        </div>
        <div>
          <label className={etiqueta} htmlFor="sentimiento">sentimiento</label>
          <select
            id="sentimiento"
            value={sentimiento}
            onChange={(e) => setSentimiento(e.target.value)}
            className={campo}
          >
            <option value="">que lo decida Claude</option>
            {sentimientos.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={etiqueta} htmlFor="contenido">poema</label>
          <textarea
            id="contenido"
            required
            minLength={10}
            rows={14}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder={"Un verso por línea.\nDeja una línea en blanco entre estrofas."}
            className={`${campo} leading-relaxed`}
          />
        </div>
        <div>
          <label className={etiqueta} htmlFor="clave">clave</label>
          <input
            id="clave"
            type="password"
            required
            autoComplete="current-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className={campo}
          />
        </div>

        {error && <p className="font-mono-poem text-sm text-ink-red">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="self-start border-2 border-ink px-4 py-2 font-type text-sm hover:bg-ink hover:text-paper transition-colors disabled:opacity-40"
        >
          {enviando ? "guardando y clasificando…" : "agregar al archivo"}
        </button>
      </form>
    </div>
  );
}
