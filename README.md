# Tírame un Poemita — frontend

Interfaz web para [tirame-un-poemita](https://github.com/jorge-henao/tirame-un-poemita): poemas al azar, búsqueda semántica y reproducción de audio, con una estética de máquina de escribir — papel envejecido, tipografía `Special Elite`/`Courier Prime`, texto que se teclea letra por letra con su propio sonido, y un reproductor de audio con forma de carrete de cinta.

## Requisitos

- Node.js 20+
- El backend (Query Service) corriendo — ver el repo principal `tirame-un-poemita`, típicamente con:

  ```bash
  uvicorn src.query.main:app --reload
  ```

  por defecto en `http://localhost:8000`, con CORS abierto.

## Arranque

```bash
npm install
cp .env.example .env.local   # ajusta NEXT_PUBLIC_API_URL si el backend no está en localhost:8000
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- `src/lib/api.ts` — cliente tipado del Query Service (`/api/v1/poems/*`, `/api/v1/authors`).
- `src/lib/typewriterSound.ts` — sonidos de tecla/carro sintetizados con Web Audio API (sin archivos de audio externos).
- `src/components/TypewriterText.tsx` — revela texto letra por letra con cursor parpadeante.
- `src/components/TypewriterAudioPlayer.tsx` — reproductor de audio custom (carrete + cinta de progreso) sobre el endpoint de audio con soporte de Range Requests.
- Rutas: `/` (poema aleatorio), `/buscar` (búsqueda semántica), `/poema/[id]`, `/autores`, `/autor/[nombre]`.

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del Query Service | `http://localhost:8000` |
