"use client";

import { useState } from "react";
import {
  audioUrlFor,
  previsualizarProsodia,
  verificarClaveAjustes,
  type Lectura,
  type ProsodyOverrides,
} from "@/lib/api";

const CLAVE_KEY = "tirame-ajustes-clave";

function claveGuardada(): string | null {
  try {
    return window.localStorage.getItem(CLAVE_KEY);
  } catch {
    return null;
  }
}

function guardarClave(clave: string | null) {
  try {
    if (clave) window.localStorage.setItem(CLAVE_KEY, clave);
    else window.localStorage.removeItem(CLAVE_KEY);
  } catch {
    // storage unavailable: the key is asked again next time
  }
}

const DEFAULTS: Required<Omit<ProsodyOverrides, "use_speaker_boost">> = {
  lectura: "guia",
  prosody_mode: "continuous",
  break_seconds: 0.5,
  stanza_break_seconds: 1.0,
  stability: 0.65,
  similarity_boost: 1.0,
  style: 0.2,
  speed: 0.8,
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 font-mono-poem text-xs">
      <span className="flex justify-between text-ink-soft uppercase tracking-wide">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-ink-red"
      />
    </label>
  );
}

export default function ProsodyTuningPanel({
  poemId,
  previewKey,
}: {
  poemId: number;
  previewKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const [clave, setClave] = useState<string | null>(() => previewKey || claveGuardada());
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [claveInput, setClaveInput] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [claveError, setClaveError] = useState<string | null>(null);
  const [values, setValues] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<string | null>(null);

  async function abrir() {
    setOpen(true);
    if (desbloqueado || !clave) return;
    // A key saved earlier (or passed in the link): check it's still valid.
    setVerificando(true);
    const ok = await verificarClaveAjustes(clave).catch(() => false);
    setVerificando(false);
    if (ok) {
      setDesbloqueado(true);
    } else {
      guardarClave(null);
      setClave(null);
    }
  }

  async function desbloquear(e: React.FormEvent) {
    e.preventDefault();
    const intento = claveInput.trim();
    if (!intento) return;
    setVerificando(true);
    setClaveError(null);
    const ok = await verificarClaveAjustes(intento).catch(() => false);
    setVerificando(false);
    if (ok) {
      guardarClave(intento);
      setClave(intento);
      setDesbloqueado(true);
      setClaveInput("");
    } else {
      setClaveError("Clave incorrecta.");
    }
  }

  function bloquear() {
    guardarClave(null);
    setClave(null);
    setDesbloqueado(false);
    setOpen(false);
  }

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function generarPreview() {
    setLoading(true);
    setError(null);
    try {
      const result = await previsualizarProsodia(poemId, values, undefined, clave || undefined);
      setPreviewUrl(audioUrlFor(result.audio_url));
      setPreviewInfo(
        `${result.duration_seconds.toFixed(1)}s · ${
          values.lectura === "guia" ? "Edgar guiado" : "Voz de Edgar"
        } · modo ${values.prosody_mode}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el preview.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={abrir}
        className="self-start inline-flex items-center gap-2 font-mono-poem text-xs uppercase tracking-wide text-ink-soft border border-ink/30 px-3 py-1.5 hover:border-ink-red hover:text-ink-red transition-colors"
      >
        <span aria-hidden="true">⚙</span> ajustes de lectura
      </button>
    );
  }

  if (!desbloqueado) {
    return (
      <div className="border border-ink/20 bg-paper-deep/40 p-4 flex flex-col gap-3 max-w-md">
        <div className="flex items-center justify-between">
          <h3 className="font-type text-sm">ajustes de lectura</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono-poem text-xs text-ink-soft hover:text-ink-red"
          >
            cerrar
          </button>
        </div>
        {verificando && !claveInput ? (
          <p className="font-mono-poem text-xs text-ink-soft animate-pulse">verificando…</p>
        ) : (
          <form onSubmit={desbloquear} className="flex flex-col gap-2">
            <label htmlFor="clave-ajustes" className="font-mono-poem text-xs text-ink-soft">
              Escribe la clave para ajustar la lectura (cada prueba gasta créditos de voz).
            </label>
            <div className="flex gap-2">
              <input
                id="clave-ajustes"
                type="password"
                autoComplete="off"
                value={claveInput}
                onChange={(e) => setClaveInput(e.target.value)}
                className="flex-1 border border-ink/30 bg-paper px-3 py-1.5 font-mono-poem text-sm outline-none focus:border-ink-red"
              />
              <button
                type="submit"
                disabled={verificando}
                className="border-2 border-ink px-3 py-1 font-type text-xs uppercase tracking-wide hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
              >
                {verificando ? "…" : "entrar"}
              </button>
            </div>
            {claveError && <p className="font-mono-poem text-xs text-ink-red">{claveError}</p>}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="border border-ink/20 bg-paper-deep/40 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-type text-sm">ajustes de lectura</h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={bloquear}
            className="font-mono-poem text-xs text-ink-soft hover:text-ink-red"
          >
            salir
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-mono-poem text-xs text-ink-soft hover:text-ink-red"
          >
            cerrar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-mono-poem text-[11px] uppercase tracking-wide text-ink-soft">voz</span>
        <div className="flex gap-2 font-mono-poem text-xs">
          {(
            [
              ["guia", "Edgar guiado"],
              ["directa", "Voz de Edgar"],
            ] as [Lectura, string][]
          ).map(([v, nombre]) => (
            <button
              key={v}
              type="button"
              onClick={() => set("lectura", v)}
              className={`px-3 py-1 border uppercase tracking-wide ${
                values.lectura === v
                  ? "border-ink-red text-ink-red"
                  : "border-ink/20 text-ink-soft hover:border-ink/40"
              }`}
            >
              {nombre}
            </button>
          ))}
        </div>
      </div>

      <span className="font-mono-poem text-[11px] uppercase tracking-wide text-ink-soft -mb-2">
        modo de lectura
      </span>
      <div className="flex gap-2 font-mono-poem text-xs">
        {(["continuous", "break", "segment", "sts"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => set("prosody_mode", mode)}
            className={`px-3 py-1 border uppercase tracking-wide ${
              values.prosody_mode === mode
                ? "border-ink-red text-ink-red"
                : "border-ink/20 text-ink-soft hover:border-ink/40"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {values.prosody_mode === "continuous" && (
        <p className="font-mono-poem text-[11px] text-ink-soft border border-ink/15 px-3 py-2">
          En modo <strong>continuous</strong> el poema se lee de corrido en una sola pieza y la
          voz hace sus propias pausas; al final se aplica el cierre en la última palabra.
        </p>
      )}

      {values.prosody_mode === "sts" && (
        <p className="font-mono-poem text-[11px] text-ink-soft border border-ink/15 px-3 py-2">
          En modo <strong>sts</strong> el ritmo viene de una lectura natural convertida a la
          voz — las pausas por línea/estrofa no aplican aquí, solo los parámetros de voz.
        </p>
      )}

      {values.lectura === "guia" && (
        <p className="font-mono-poem text-[11px] text-ink-soft border border-ink/15 px-3 py-2">
          En <strong>Edgar guiado</strong> el tono de la voz lo da el Voice Changer, así que aquí
          solo se ajustan el modo, las pausas y la velocidad.
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {(values.prosody_mode === "break" || values.prosody_mode === "segment") && (
          <>
            <Slider
              label="pausa por línea (s)"
              value={values.break_seconds}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => set("break_seconds", v)}
            />
            <Slider
              label="pausa por estrofa (s)"
              value={values.stanza_break_seconds}
              min={0}
              max={4}
              step={0.1}
              onChange={(v) => set("stanza_break_seconds", v)}
            />
          </>
        )}
        {values.lectura === "directa" && (
          <>
        <Slider
          label="stability"
          value={values.stability}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => set("stability", v)}
        />
        <Slider
          label="similarity boost"
          value={values.similarity_boost}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => set("similarity_boost", v)}
        />
        <Slider
          label="style"
          value={values.style}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => set("style", v)}
        />
          </>
        )}
        <Slider
          label="speed"
          value={values.speed}
          min={0.5}
          max={1.5}
          step={0.01}
          onChange={(v) => set("speed", v)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={generarPreview}
          disabled={loading}
          className="border-2 border-ink px-3 py-1.5 font-type text-xs uppercase tracking-wide hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        >
          {loading ? "generando…" : "generar preview"}
        </button>
        <button
          type="button"
          onClick={() => setValues(DEFAULTS)}
          className="font-mono-poem text-xs text-ink-soft hover:text-ink-red"
        >
          volver a lo predeterminado
        </button>
      </div>

      {error && (
        <p className="font-mono-poem text-xs text-ink-red border border-ink-red/40 px-3 py-2">
          {error}
        </p>
      )}

      {previewUrl && (
        <div className="flex flex-col gap-1">
          <audio controls src={previewUrl} className="w-full" />
          {previewInfo && (
            <span className="font-mono-poem text-[10px] text-ink-soft">{previewInfo}</span>
          )}
        </div>
      )}
    </div>
  );
}
