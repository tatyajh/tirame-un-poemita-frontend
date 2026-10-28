let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Short decaying noise, made once and reused for every key. */
function getNoise(audioCtx: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== audioCtx.sampleRate) {
    const length = Math.floor(audioCtx.sampleRate * 0.06);
    noiseBuffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
  return noiseBuffer;
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const stored = window.localStorage.getItem("tup-sound");
    return stored === null ? true : stored === "on";
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem("tup-sound", enabled ? "on" : "off");
  } catch {
    // storage unavailable: the choice lasts until the page is reloaded
  }
}

/** A burst of noise through a band-pass filter, with its own envelope. */
function burst(audioCtx: AudioContext, at: number, freq: number, q: number, peak: number, length: number) {
  const src = audioCtx.createBufferSource();
  src.buffer = getNoise(audioCtx);
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(peak, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(filter).connect(gain).connect(audioCtx.destination);
  src.start(at);
  src.stop(at + length + 0.01);
}

/** A typewriter key strike: the type bar's metallic clack on the platen
 * plus the low thud of the key going down. Slightly different every time. */
export function playKeystroke() {
  if (!isSoundEnabled()) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const v = 0.8 + Math.random() * 0.4;
  burst(audioCtx, now, 2600 + Math.random() * 900, 1.2, 0.5 * v, 0.025); // clack
  burst(audioCtx, now + 0.004, 180 + Math.random() * 60, 0.9, 0.9 * v, 0.06); // thud
}

/** End of line: the carriage bell, then the return lever's ratchet. */
export function playCarriageReturn() {
  if (!isSoundEnabled()) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  for (const [freq, level] of [[2350, 0.08], [4700, 0.025], [7050, 0.01]] as const) {
    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.92);
  }
  for (let i = 0; i < 6; i++) {
    burst(audioCtx, now + 0.12 + i * 0.022, 1500, 2, 0.12, 0.015); // ratchet
  }
}
