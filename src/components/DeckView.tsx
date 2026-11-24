import { useEffect, useState } from 'react'
import { Pause, Play, SkipBack, Rewind, FastForward, RefreshCw, Minus, Plus } from 'lucide-react'
import { getEngine } from '../audio/AudioEngine'
import { useStore } from '../state/store'
import type { DeckId } from '../types'
import { Vinyl } from './Vinyl'
import { Waveform } from './Waveform'

function Mini({ label, value, display, min, max, step, onChange }: {
  label: string; value: number; display: string; min: number; max: number; step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="mini-knob">
      <label>{label}</label>
      <input className="h-slider" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
      <output>{display}</output>
    </div>
  )
}

export function DeckView({ id }: { id: DeckId }) {
  const engine = getEngine()
  const deck = engine.deck(id)
  const track = useStore((s) => s.tracks.find((t) => t.id === s.selected[id]))
  const [, force] = useState(0)
  const [eq, setEq] = useState({ low: 0, mid: 0, high: 0 })
  const [cutoff, setCutoff] = useState(20000)
  const [reverb, setReverb] = useState(0)
  const [rate, setRate] = useState(1)

  useEffect(() => {
    const timer = window.setInterval(() => force((n) => n + 1), 60)
    return () => window.clearInterval(timer)
  }, [])

  const changeRate = (delta: number) => {
    const r = Math.max(0.5, Math.min(2, Math.round((deck.playbackRate + delta) * 100) / 100))
    deck.setRate(r)
    setRate(r)
  }
  const sync = () => {
    const other = engine.deck(id === 0 ? 1 : 0)
    if (deck.bpm > 0 && other.bpm > 0) {
      const r = Math.max(0.5, Math.min(2, other.bpm / deck.bpm))
      deck.setRate(r)
      setRate(r)
    }
  }
  const bpm = track ? Math.round(track.bpm * rate) : 0

  return (
    <section className="deck card">
      <div className="deck-head">
        <div className="deck-badge">{id === 0 ? 'A' : 'B'}</div>
        <div className="deck-track">
          <strong>{track?.name ?? 'No track loaded'}</strong>
          <span>{track ? `${track.bpm ? `${track.bpm} BPM detected` : 'BPM unknown'} · ${track.name}` : 'Load a track from the library below'}</span>
        </div>
      </div>

      <div className="bpm-row">
        <button className="round-btn" onClick={() => changeRate(-0.02)} title="Slow down"><Minus size={16} /></button>
        <div className="bpm-val"><strong>{bpm || '—'}</strong><span>BPM</span></div>
        <button className="round-btn" onClick={() => changeRate(0.02)} title="Speed up"><Plus size={16} /></button>
      </div>

      <Vinyl progress={deck.progress} time={deck.currentTime} duration={deck.duration} />

      <div className="transport">
        <button className="round-btn" onClick={() => deck.cue()} title="Cue"><SkipBack size={17} /></button>
        <button className="round-btn small-btn" onClick={() => deck.nudge(-0.05)} title="Nudge back"><Rewind size={15} /></button>
        <button className="play-btn" onClick={() => { if (deck.playing) deck.pause(); else void deck.play() }} title="Play / Pause (Q or P)">
          {deck.playing ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button className="round-btn small-btn" onClick={() => deck.nudge(0.05)} title="Nudge forward"><FastForward size={15} /></button>
        <button className="round-btn" onClick={sync} title="Sync BPM"><RefreshCw size={16} /></button>
        <span className="rate-chip">{rate.toFixed(2)}x</span>
      </div>

      <Waveform deck={deck} />

      <div className="deck-controls">
        <Mini label="LOW" value={eq.low} display={`${eq.low > 0 ? '+' : ''}${eq.low.toFixed(1)}dB`} min={-24} max={12} step={0.5} onChange={(v) => { setEq((s) => ({ ...s, low: v })); deck.setEq('low', v) }} />
        <Mini label="MID" value={eq.mid} display={`${eq.mid > 0 ? '+' : ''}${eq.mid.toFixed(1)}dB`} min={-24} max={12} step={0.5} onChange={(v) => { setEq((s) => ({ ...s, mid: v })); deck.setEq('mid', v) }} />
        <Mini label="HIGH" value={eq.high} display={`${eq.high > 0 ? '+' : ''}${eq.high.toFixed(1)}dB`} min={-24} max={12} step={0.5} onChange={(v) => { setEq((s) => ({ ...s, high: v })); deck.setEq('high', v) }} />
        <Mini label="FILTER" value={cutoff} display={`${(cutoff / 1000).toFixed(1)}k`} min={200} max={20000} step={10} onChange={(v) => { setCutoff(v); deck.setFilter(v) }} />
        <Mini label="REVERB" value={reverb} display={`${Math.round(reverb * 100)}%`} min={0} max={1} step={0.01} onChange={(v) => { setReverb(v); deck.setReverb(v) }} />
      </div>
    </section>
  )
}
