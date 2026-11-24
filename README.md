# Gate 31

A cross-platform DJ application. Web-first PWA that runs in a browser on **macOS, Windows, iOS and Android**, with native wrappers (Electron / Capacitor) configured. Built on the Web Audio API — real decoding, mixing, EQ, effects and recording, no mock data.

## Features (v0.1)
- Two independent decks: load, play/pause, cue, seek (click waveform), nudge, BPM sync via playback rate
- Real waveform rendering from decoded audio + live analyser VU meters
- 3-band EQ per deck, lowpass filter, convolution reverb
- Equal-power crossfader, per-channel volume, master volume
- Local library with drag-and-drop / multi-file import, search, crates
- Live mix recording → downloadable `.webm`
- Optional Supabase metadata sync (audio files never leave the device)
- PWA installable offline; keyboard shortcuts `Q` / `P` for decks A / B

## Quick start
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build into dist/
npm run typecheck
```
Click anywhere once to unlock the browser AudioContext. Import MP3/WAV/OGG/M4A/FLAC files, drag them onto a deck, and press play.

## Tech stack
React 19 + TypeScript + Vite · Zustand · Web Audio API · Supabase (optional) · PWA service worker.

## Accounts & deployment
I cannot create GitHub / Vercel / Supabase accounts for you — they require your email verification and credentials. Everything is prepared locally; use **your** accounts:

### GitHub
```bash
cd gate31
git init
git add .
git commit -m "Gate 31 v0.1 — cross-platform DJ studio"
git branch -M main
git remote add origin https://github.com/<your-username>/gate31.git
git push -u origin main
```
If you want me to do the push, give me a **personal access token** with `repo` scope (or set up `gh auth login`) and tell me the repo URL — never paste a password in chat.

### Vercel
Import the repo at https://vercel.com/new (framework: Vite, build `npm run build`, output `dist`), or:
```bash
npx vercel --prod
```
`vercel.json` already contains the SPA rewrite and cache headers.

### Supabase (optional)
1. Create a project at https://supabase.com, run `supabase/schema.sql` in the SQL editor.
2. `cp .env.example .env.local` and fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
3. Rebuild. The library button becomes "Sync ☁". Replace the demo RLS policies with auth rules before going public.

## Native builds
**Desktop (macOS + Windows) — Electron:**
```bash
npm i -D electron electron-builder
npm run electron:dev
# packaging: npx electron-builder --mac --win
```
`electron/main.cjs` is the main process (loads `dist/` in production, dev server in development).

**Mobile (iOS + Android) — Capacitor:**
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap add ios && npx cap add android
npm run build && npm run cap:sync
npx cap open ios       # Xcode
npx cap open android   # Android Studio
```
`capacitor.config.ts` sets app id `com.gate31.dj`.

## Repository layout
```
src/audio/       AudioEngine, Deck, analysis (BPM/waveforms), effects
src/components/  DeckView, Mixer, Library, Waveform
src/state/       Zustand store
src/lib/         Supabase client
electron/        Electron main process
supabase/        SQL schema
scripts/         icon generator, deploy helper
public/          PWA manifest, service worker, icons
```

## Roadmap
hot-cue memory loops · beat-grid & phrase sync · key detection / harmonic mixing · sampler pads · multi-deck · cloud audio storage with auth · MIDI controller mapping.
