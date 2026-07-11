# Muse

Offline-first personal music app (Tauri v2 + React + Rust + SQLite)

## Project structure

- `apps/muse/src-tauri`: Tauri desktop app (Rust backend + frontend build glue)
- `frontend`: React + TypeScript UI (Vite)
- `crates/*`: Rust domain/services/repositories/infrastructure (layered architecture)

## Goals

- Offline-first library with **copy-based** imports (portable library)
- SHA-256 content hashing for dedupe
- Preserve embedded metadata & artwork (no paid APIs)
- Modular import pipeline for future bulk imports, rescans, refresh, and auto-organization
