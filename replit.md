# JARVIS AI Voice Assistant

## Overview

Full-stack AI voice assistant web app — a futuristic JARVIS-themed interface inspired by Iron Man. Features a chat interface, voice input (Web Speech API), music player (YouTube library), news dashboard, command history, and JWT authentication.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind v4
- **Auth**: JWT (jsonwebtoken) with localStorage
- **Routing**: Wouter
- **Animations**: Framer Motion
- **Charts**: Recharts

## Architecture

### Frontend (`artifacts/jarvis/`)
- Dark futuristic HUD theme with electric cyan accents
- Pages: `/` (dashboard), `/chat`, `/music`, `/news`, `/history`, `/auth`
- Voice input via Web Speech API → POST /api/voice-command
- Chat interface with typing animation
- JWT stored in localStorage as `jarvis_token`
- Auth token injected via `setAuthTokenGetter` from `@workspace/api-client-react`

### Backend (`artifacts/api-server/`)
Routes:
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user (Bearer auth)
- `POST /api/chat` — Send text message to JARVIS
- `POST /api/voice-command` — Process voice command
- `POST /api/play-music` — Get YouTube link for song
- `GET /api/music/library` — All songs in library
- `GET /api/news` — Top headlines (mock or NewsAPI)
- `GET /api/history` — Command history
- `GET /api/history/stats` — Activity statistics

### Database (`lib/db/src/schema/`)
- `users` — username, password_hash, created_at
- `command_history` — type, input, response, action, user_id, created_at

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables

- `SESSION_SECRET` — JWT signing secret
- `NEWS_API_KEY` — (optional) NewsAPI.org key for real news headlines
- `GEMINI_API_KEY` or `OPENAI_API_KEY` — (optional) for real AI responses in chat

## Music Library

Songs from `attached_assets/musicLib_1776253859367.py` are embedded in `artifacts/api-server/src/lib/music-library.ts`. The library includes ~35 songs accessible by name (e.g., "play pasoori").
