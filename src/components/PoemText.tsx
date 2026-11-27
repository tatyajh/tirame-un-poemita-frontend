/**
 * The poem's text, shown at once with a short, subtle fade-in line by line
 * (no typing effect, no sound). The whole fade lasts at most ~1 s however
 * long the poem is, and is skipped for people who prefer reduced motion.
 */
const STEP_MS = 35;
const MAX_DELAY_MS = 900;

export default function PoemText({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  const step = Math.min(STEP_MS, MAX_DELAY_MS / Math.max(lines.length, 1));
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className="poem-line"
          style={{ animationDelay: `${Math.round(i * step)}ms` }}
        >
          {line === "" ? " " : line}
        </span>
      ))}
    </span>
  );
}
