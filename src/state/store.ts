import { create } from 'zustand'
import { getEngine } from '../audio/AudioEngine'
import { computePeaks, detectBpm } from '../audio/analyze'
import type { Crate, DeckId, Track } from '../types'

const COLORS = ['#7c5cff', '#00e5ff', '#ff4d8d', '#ffd166', '#4ade80', '#ff8fab']

interface Store {
  tracks: Track[]
  crates: Crate[]
  activeCrate: string | null
  selected: [string | null, string | null]
  importing: boolean
  error: string | null
  addFiles: (files: File[]) => Promise<void>
  removeTrack: (id: string) => void
  loadToDeck: (deck: DeckId, trackId: string) => void
  createCrate: (name: string) => void
  toggleInCrate: (crateId: string, trackId: string) => void
  setActiveCrate: (id: string | null) => void
  replaceLibrary: (tracks: Track[], crates: Crate[]) => void
  clearError: () => void
}

export const useStore = create<Store>((set, get) => ({
  tracks: [],
  crates: [],
  activeCrate: null,
  selected: [null, null],
  importing: false,
  error: null,

  addFiles: async (files) => {
    const engine = getEngine()
    void engine.resume()
    set({ importing: true, error: null })
    const added: Track[] = []
    for (const file of files) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) continue
      try {
        const buffer = await engine.decode(file)
        added.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          file, buffer,
          duration: buffer.duration,
          bpm: detectBpm(buffer),
          peaks: computePeaks(buffer),
          color: COLORS[get().tracks.length % COLORS.length],
          addedAt: Date.now(),
        })
      } catch {
        set({ error: `Could not decode ${file.name}` })
      }
    }
    set((s) => ({ tracks: [...s.tracks, ...added], importing: false }))
  },

  removeTrack: (id) => set((s) => {
    const idx = s.selected.indexOf(id)
    const selected: [string | null, string | null] = [...s.selected]
    if (idx >= 0) selected[idx] = null
    return {
      tracks: s.tracks.filter((t) => t.id !== id),
      crates: s.crates.map((c) => ({ ...c, trackIds: c.trackIds.filter((t) => t !== id) })),
      selected,
    }
  }),

  loadToDeck: (deck, trackId) => {
    const track = get().tracks.find((t) => t.id === trackId)
    if (!track) return
    const engine = getEngine()
    engine.deck(deck).load(track.buffer, track.peaks, track.bpm)
    set((s) => {
      const selected: [string | null, string | null] = [...s.selected]
      selected[deck] = trackId
      return { selected }
    })
  },

  createCrate: (name) => set((s) => ({
    crates: [...s.crates, { id: `${Date.now()}`, name: name.trim() || 'New crate', trackIds: [] }],
  })),

  toggleInCrate: (crateId, trackId) => set((s) => ({
    crates: s.crates.map((c) => c.id !== crateId ? c : {
      ...c,
      trackIds: c.trackIds.includes(trackId)
        ? c.trackIds.filter((t) => t !== trackId)
        : [...c.trackIds, trackId],
    }),
  })),

  setActiveCrate: (id) => set({ activeCrate: id }),
  replaceLibrary: (tracks, crates) => set({ tracks, crates }),
  clearError: () => set({ error: null }),
}))
