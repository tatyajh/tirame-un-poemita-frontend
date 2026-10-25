const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export interface Autor {
  id: number;
  nombre: string;
  nacionalidad: string | null;
  epoca: string | null;
}

export interface Poema {
  id: number;
  titulo: string;
  contenido: string;
  autor: Autor | null;
  sentimiento?: string | null;
  sentimiento_nombre?: string | null;
  /** Every sentiment of the poem, main one first. */
  sentimientos?: { slug: string; nombre: string }[];
}

/** "duelo · familia" (lower case), falling back to the main sentiment. */
export function etiquetaSentimientos(p: Poema): string | null {
  const nombres = p.sentimientos?.length
    ? p.sentimientos.map((s) => s.nombre)
    : p.sentimiento_nombre
      ? [p.sentimiento_nombre]
      : [];
  return nombres.length ? nombres.join(" · ").toLowerCase() : null;
}

export interface Sentimiento {
  slug: string;
  nombre: string;
  descripcion: string;
  total: number;
}

export interface ResultadoBusqueda {
  poem: Poema;
  score: number;
}

export interface RespuestaBusqueda {
  results: ResultadoBusqueda[];
  total: number;
  query: string | null;
}

export interface RespuestaAudio {
  audio_url: string;
  poem_id: number;
  duration_seconds: number | null;
  with_music: boolean;
  cached: boolean;
  narrador: string | null;
  idioma: string;
}

export interface RespuestaAutores {
  authors: Autor[];
  total: number;
  limit: number;
  offset: number;
}

export interface SugerenciaError {
  type: string;
  value: string;
  id: number | null;
}

export class PoemNotFoundError extends Error {
  suggestions: SugerenciaError[];
  constructor(message: string, suggestions: SugerenciaError[] = []) {
    super(message);
    this.name = "PoemNotFoundError";
    this.suggestions = suggestions;
  }
}

async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean>,
  signal?: AbortSignal,
) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString(), { cache: "no-store", signal });

  if (!res.ok) {
    if (res.status === 404) {
      const body = await res.json().catch(() => null);
      const detail = body?.detail;
      throw new PoemNotFoundError(
        detail?.message ?? "No se encontró ningún poema.",
        detail?.suggestions ?? [],
      );
    }
    throw new Error(`La máquina falló al pedir ${path}: ${res.status}`);
  }

  return (await res.json()) as T;
}

export function audioUrlFor(url: string) {
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function getPoemaAleatorio(
  filtros: { sentimiento?: string | null; autor?: string | null } = {},
): Promise<Poema> {
  const params: Record<string, string> = {};
  if (filtros.sentimiento) params.sentimiento = filtros.sentimiento;
  if (filtros.autor) params.autor = filtros.autor;
  const data = await apiGet<{ poem: Poema }>("/api/v1/poems/random", params);
  return data.poem;
}

export async function listarSentimientos(): Promise<Sentimiento[]> {
  const data = await apiGet<{ sentimientos: Sentimiento[] }>("/api/v1/sentimientos");
  return data.sentimientos;
}

export async function getPoemaPorId(id: number | string): Promise<Poema> {
  const data = await apiGet<{ poem: Poema }>(`/api/v1/poems/${id}`);
  return data.poem;
}

export async function buscarPoemasSemantico(query: string, limit = 8): Promise<RespuestaBusqueda> {
  return apiGet<RespuestaBusqueda>("/api/v1/poems/search", { q: query, limit });
}

export async function buscarPorAutor(autor: string, limit = 20): Promise<RespuestaBusqueda> {
  return apiGet<RespuestaBusqueda>("/api/v1/poems/by-author", { author: autor, limit });
}

/** "directa": the Edgar clone reads. "guia": Anyelo reads and Voice Changer
 * turns it into Edgar's voice. */
export type Lectura = "directa" | "guia";

export async function getAudioDePoema(
  poemId: number | string,
  withMusic = false,
  signal?: AbortSignal,
  lectura: Lectura = "directa",
): Promise<RespuestaAudio> {
  return apiGet<RespuestaAudio>(
    `/api/v1/poems/${poemId}/audio`,
    { with_music: withMusic, lectura },
    signal,
  );
}

export async function listarAutores(search?: string, limit = 60): Promise<RespuestaAutores> {
  return apiGet<RespuestaAutores>("/api/v1/authors", { search: search ?? "", limit });
}

export interface ProsodyOverrides {
  prosody_mode?: "continuous" | "break" | "segment" | "sts";
  break_seconds?: number;
  stanza_break_seconds?: number;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  speed?: number;
  use_speaker_boost?: boolean;
}

export interface RespuestaPreview {
  audio_url: string;
  poem_id: number;
  duration_seconds: number;
  settings_used: Required<Omit<ProsodyOverrides, "use_speaker_boost">>;
}

export async function previsualizarProsodia(
  poemId: number | string,
  overrides: ProsodyOverrides,
  signal?: AbortSignal,
  previewKey?: string,
): Promise<RespuestaPreview> {
  const res = await fetch(`${API_BASE_URL}/api/v1/poems/${poemId}/audio/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(previewKey ? { "X-Preview-Key": previewKey } : {}),
    },
    body: JSON.stringify(overrides),
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.detail?.message ?? body?.detail ?? `Error ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return (await res.json()) as RespuestaPreview;
}

export interface PoemaNuevo {
  titulo: string;
  contenido: string;
  autor: string;
  nacionalidad?: string | null;
  epoca?: string | null;
  /** Empty = Claude decides the sentiment. */
  sentimiento?: string | null;
}

export async function agregarPoema(poema: PoemaNuevo, adminKey: string): Promise<Poema> {
  const body: Record<string, string> = {
    titulo: poema.titulo.trim(),
    contenido: poema.contenido.trim(),
    autor: poema.autor.trim(),
  };
  if (poema.nacionalidad?.trim()) body.nacionalidad = poema.nacionalidad.trim();
  if (poema.epoca?.trim()) body.epoca = poema.epoca.trim();
  if (poema.sentimiento) body.sentimiento = poema.sentimiento;

  const res = await fetch(`${API_BASE_URL}/api/v1/poems`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (res.status === 403) throw new Error("La clave no es correcta.");
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = data?.detail;
    const msg = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).join(" · ")
      : typeof detail === "string"
        ? detail
        : `Error ${res.status}`;
    throw new Error(msg);
  }
  return ((await res.json()) as { poem: Poema }).poem;
}
