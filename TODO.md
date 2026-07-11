# Muse (Tauri + React) — TODO

## Plan (approved by user)
1. Create a Tauri v2 project scaffold (Rust backend + React + TS frontend).
2. Add Tailwind CSS, React Router, Zustand.
3. Implement modular Rust backend:
   - Domain: entities for Track/Artist/Album/Playlist placeholders.
   - Services: import pipeline, dedupe (SHA-256), metadata reader, library repo.
   - Repositories: SQLite repository + migrations/schema.
   - Infrastructure: filesystem/app-data paths, tag reading, cover extraction.
   - UI bridge: Tauri commands + event emission.
4. Implement offline-first library storage:
   - Copy imported files into app-managed library folder.
   - Store only relative paths + content hash in SQLite.
   - Preserve embedded artwork.
5. Implement initial UI shell resembling Spotify/Apple Music layout:
   - Sidebar + main list + bottom player controls (playback minimal v1).
6. Implement playback (offline): basic play/pause/next/prev/seek if supported.
7. Add import UI via drag-and-drop:
   - Accept common audio formats.
   - Show progress, success/failure.
8. Add basic search stub + placeholders for future modules.
9. Testing & dev setup:
   - Unit tests for filename parsing + metadata extraction fallbacks.
   - Integration smoke test: import → DB → UI list.

## Progress
- [ ] Create project scaffold
- [ ] Add frontend tooling (Tailwind/Router/Zustand)
- [ ] Add Rust architecture modules
- [ ] Add SQLite schema + repo
- [ ] Implement import pipeline (copy + sha256 + tags + artwork)
- [ ] Implement Tauri commands + UI drag/drop
- [ ] Implement minimal playback engine
- [ ] Create UI shell
- [ ] Run dev build + smoke tests

