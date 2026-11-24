export type DeckId = 0 | 1

export interface Track {
  id: string
  name: string
  file: File
  buffer: AudioBuffer
  duration: number
  bpm: number
  peaks: number[]
  color: string
  addedAt: number
}

export interface Crate {
  id: string
  name: string
  trackIds: string[]
}
