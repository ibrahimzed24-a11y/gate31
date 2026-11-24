import { useEffect, useState } from 'react'
import { Pause, Play, SkipBack, Rewind, FastForward, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { getEngine } from '../audio/AudioEngine'
import { formatTime } from '../audio/analyze'
import { useStore } from '../state/store'
import type { DeckId } from '../types'
import { Waveform } from './Waveform'

function Knob({ label, value, min, max, step, onChange, unit = '' }: {
  label: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; unit?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className="knob">
      <span className="knob-dial" style={{ '--pct': `${pct}%` } as React.CSSProperties}>
        <span className="knob-face" />
      </span>
      <span className="knob-label">{label}</span>
      <span className="knob-value">{value > 0 && unit === 'dB' ? '+' : ''}{value.toFixed(unit === 'dB' ? 1 : 0)}{unit}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </label>
  )
}

export function DeckView({ id }: { id: DeckId }) {
  const engine = getEngine()
  const deck = engine.deck(id)
  const selected = useStore((s) => s.selected[id])
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

  const sync = () => {
    const other = engine.deck(id === 0 ? 1 : 0)
    if (deck.bpm > 0 && other.bpm > 0) {
      const r = Math.max(0.5, Math.min(2, other.bpm / deck.bpm))
      deck.setRate(r)
      setRate(r)
    }
  }
  const color = track?.color ?? (id === 0 ? '#7c5cff' : '#00e5ff')

  return (
    <section className="deck panel" style={{ '--deck-color': color } as React.CSSProperties}>
      <div className="deck-head">
        <div className="deck-badge">DECK {id === 0 ? 'A' : 'B'}</div>
        <div className="deck-track">
          <strong>{track?.name ?? 'No track loaded'}</strong>
          <span>{track ? `${formatTime(deck.duration)} · ${deck.bpm ? `${deck.bpm} BPM` : 'BPM unknown'}` : 'Drop a track from the library'}</span>
        </div>
        <button className="icon-btn" onClick={() => setEq({ low: 0, mid: 0, high: 0 })} title="Reset EQ"><SlidersHorizontal size={16} /></button>
      </div>

      <Waveform deck={deck} color={color} />

      <div className="transport">
        <button className="tbtn" onClick={() => deck.cue()} title="Cue / return to start"><SkipBack size={18} /></button>
        <button className="tbtn small" onClick={() => deck.nudge(-0.05)} title="Nudge back"><Rewind size={16} /></button>
        <button className="play-btn" onClick={() => { if (deck.playing) deck.pause(); else void deck.play() }} title="Play / Pause (Q or P)">
          {deck.playing ? <Pause size={26} /> : <Play size={26} />}
        </button>
        <button className="tbtn small" onClick={() => deck.nudge(0.05)} title="Nudge forward"><FastForward size={16} /></button>
        <button className="tbtn" onClick={sync} title="Sync BPM to other deck"><RefreshCw size={18} /></button>
        <span className="time">{formatTime(deck.currentTime)} <em>/</em> {formatTime(deck.duration)}</span>
        <span className="rate">{(rate).toFixed(2)}x</span>
      </div>

      <div className="deck-controls">
        <div className="eq-row">
          <Knob label="LOW" value={eq.low} min={-24} max={12} step={0.5} unit="dB" onChange={(v) => { setEq((s) => ({ ...s, low: v })); deck.setEq('low', v) }} />
          <Knob label="MID" value={eq.mid} min={-24} max={12} step={0.5} unit="dB" onChange={(v) => { setEq((s) => ({ ...s, mid: v })); deck.setEq('mid', v) }} />
          <Knob label="HIGH" value={eq.high} min={-24} max={12} step={0.5} unit="dB" onChange={(v) => { setEq((s) => ({ ...s, high: v })); deck.setEq('high', v) }} />
        </div>
        <div className="fx-row">
          <Knob label="FILTER" value={cutoff} min={200} max={20000} step={10} unit="Hz" onChange={(v) => { setCutoff(v); deck.setFilter(v) }} />
          <Knob label="REVERB" value={reverb} min={0} max={1} step={0.01} onChange={(v) => { setReverb(v); deck.setReverb(v) }} />
        </div>
      </div>
      <span className="sr-only">{selected ? `Deck ${id} loaded` : ''}</span>
    </section>
  )
}
