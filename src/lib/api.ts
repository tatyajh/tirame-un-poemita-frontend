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

export async function getPoemaAleatorio(): Promise<Poema> {
  const data = await apiGet<{ poem: Poema }>("/api/v1/poems/random");
  return data.poem;
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

export async function getAudioDePoema(
  poemId: number | string,
  withMusic = false,
  signal?: AbortSignal,
): Promise<RespuestaAudio> {
  return apiGet<RespuestaAudio>(
    `/api/v1/poems/${poemId}/audio`,
    { with_music: withMusic },
    signal,
  );
}

export async function listarAutores(search?: string, limit = 60): Promise<RespuestaAutores> {
  return apiGet<RespuestaAutores>("/api/v1/authors", { search: search ?? "", limit });
}

export interface ProsodyOverrides {
  prosody_mode?: "break" | "segment" | "sts";
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
): Promise<RespuestaPreview> {
  const res = await fetch(`${API_BASE_URL}/api/v1/poems/${poemId}/audio/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
