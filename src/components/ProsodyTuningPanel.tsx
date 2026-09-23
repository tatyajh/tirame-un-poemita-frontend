"use client";

import { useState } from "react";
import { audioUrlFor, previsualizarProsodia, type ProsodyOverrides } from "@/lib/api";

const DEFAULTS: Required<Omit<ProsodyOverrides, "use_speaker_boost">> = {
  prosody_mode: "break",
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

export default function ProsodyTuningPanel({ poemId }: { poemId: number }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewInfo, setPreviewInfo] = useState<string | null>(null);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function generarPreview() {
    setLoading(true);
    setError(null);
    try {
      const result = await previsualizarProsodia(poemId, values);
      setPreviewUrl(audioUrlFor(result.audio_url));
      setPreviewInfo(`${result.duration_seconds.toFixed(1)}s · modo ${values.prosody_mode}`);
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
        onClick={() => setOpen(true)}
        className="self-start font-mono-poem text-[11px] uppercase tracking-wide text-ink-soft border border-ink/20 px-2 py-1 hover:border-ink-red hover:text-ink-red transition-colors"
      >
        ⚙ ajustar prosodia en vivo
      </button>
    );
  }

  return (
    <div className="border border-ink/20 bg-paper-deep/40 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-type text-sm">prosodia en vivo</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono-poem text-xs text-ink-soft hover:text-ink-red"
        >
          cerrar
        </button>
      </div>

      <div className="flex gap-2 font-mono-poem text-xs">
        {(["break", "segment", "sts"] as const).map((mode) => (
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

      {values.prosody_mode === "sts" && (
        <p className="font-mono-poem text-[11px] text-ink-soft border border-ink/15 px-3 py-2">
          En modo <strong>sts</strong> el ritmo viene de una lectura natural convertida a la
          voz — las pausas por línea/estrofa no aplican aquí, solo los parámetros de voz.
        </p>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {values.prosody_mode !== "sts" && (
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
          reset a poetico_intimo
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
