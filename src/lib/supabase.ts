import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null
export const cloudEnabled = !!supabase

/** Metadata-only sync (audio files stay on the local device). */
export async function pushLibrary(
  tracks: { id: string; name: string; duration: number; bpm: number; peaks: number[]; color: string; addedAt: number }[],
  crates: { id: string; name: string; trackIds: string[] }[],
) {
  if (!supabase) return
  await supabase.from('crates').upsert(crates.map((c) => ({
    id: c.id, name: c.name, track_ids: c.trackIds,
  })))
  await supabase.from('tracks').upsert(tracks.map((t) => ({
    id: t.id, name: t.name, duration: t.duration, bpm: t.bpm,
    peaks: t.peaks, color: t.color, added_at: t.addedAt,
  })))
}

export async function pullLibrary(): Promise<{ tracks: any[]; crates: any[] }> {
  if (!supabase) return { tracks: [], crates: [] }
  const [tracks, crates] = await Promise.all([
    supabase.from('tracks').select('*'),
    supabase.from('crates').select('*'),
  ])
  return { tracks: tracks.data ?? [], crates: crates.data ?? [] }
}
