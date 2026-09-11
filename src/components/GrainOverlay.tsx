"use client";

/**
 * Fixed, decorative-only overlay: faint ink stamp in the corner + a hairline
 * frame, so every page feels like a sheet fed into the same machine.
 */
export default function GrainOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div className="absolute inset-3 border border-ink/15 sm:inset-6" />
      <div className="absolute bottom-4 right-4 hidden sm:block stamp-rotate opacity-25">
        <span className="font-type text-[10px] tracking-[0.35em] text-ink-red border border-ink-red/60 px-2 py-1 uppercase">
          Nº 001 · original
        </span>
      </div>
    </div>
  );
}
