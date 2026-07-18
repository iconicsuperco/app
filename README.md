# Muse

A premium, fully-local personal music streaming web app. Spotify/Apple Music–inspired UI with zero paid dependencies — your library lives entirely in your browser.

## Features

- **Modern, premium UI** — dark-first design, glassmorphism, spring-based animations
- **Fully local** — drag-and-drop audio files; everything persists in IndexedDB
- **Automatic metadata extraction** — title, artist, album, artwork, genre, year, track #
- **PWA** — installable, works offline once loaded
- **Custom Web Audio engine** — EQ, visualizer, gapless + crossfade (Phase 1+)
- **Full player** — queue, shuffle, repeat, mini + full-screen now playing
- **Zero paid APIs** — 100% free and open-source dependencies

## Tech Stack

| Concern        | Choice                              |
| -------------- | ----------------------------------- |
| Framework      | React 19 + TypeScript               |
| Build tool     | Vite 6                              |
| Styling        | Tailwind CSS v4                     |
| Components     | Radix UI (headless)                 |
| Animation      | Framer Motion                       |
| Routing        | React Router v7                     |
| State          | Zustand                             |
| Persistence    | Dexie.js (IndexedDB)                |
| Audio          | Web Audio API (custom engine)       |
| Metadata       | `music-metadata`                    |
| PWA            | `vite-plugin-pwa` (Workbox)         |

## Getting Started

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # lint
npm run test     # run unit tests
```

## Project Structure

```
src/
├── app/         # App shell: providers, routing
├── audio/       # Web Audio engine (pure TS, no React)
├── library/     # IndexedDB persistence + import pipeline
├── player/      # Playback state (player + queue stores)
├── store/       # UI + settings state (Zustand)
├── features/    # Feature pages grouped by domain
├── components/  # Shared UI primitives + layout
├── hooks/       # Reusable React hooks
├── lib/         # Utilities (formatting, color, ids)
├── styles/      # Global CSS + design tokens
└── types/       # Shared TypeScript types
```

## Development Roadmap

- [x] **Phase 0** — Foundation & design system
- [ ] **Phase 1** — Audio engine + import pipeline
- [ ] **Phase 2** — Library & browsing UI
- [ ] **Phase 3** — Player UX (mini, full-screen, queue)
- [ ] **Phase 4** — Premium features (playlists, lyrics, visualizer, EQ)
- [ ] **Phase 5** — Polish & hardening
