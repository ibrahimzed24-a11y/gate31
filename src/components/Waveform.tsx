import { useEffect, useRef } from 'react'
import type { Deck } from '../audio/Deck'

export function Waveform({ deck }: { deck: Deck }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let raf = 0
    const draw = () => {
      const canvas = ref.current
      if (canvas) {
        const cs = getComputedStyle(document.documentElement)
        const accent = cs.getPropertyValue('--accent').trim() || '#29B6F6'
        const wave = cs.getPropertyValue('--wave').trim() || '#90A4AE'
        const dpr = window.devicePixelRatio || 1
        const w = canvas.clientWidth, h = canvas.clientHeight
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr)
          canvas.height = Math.round(h * dpr)
        }
        const c = canvas.getContext('2d')
        if (c) {
          c.setTransform(dpr, 0, 0, dpr, 0, 0)
          c.clearRect(0, 0, w, h)
          const peaks = deck.peaks
          if (peaks.length) {
            const bar = w / peaks.length
            const progress = deck.progress
            for (let i = 0; i < peaks.length; i++) {
              const ph = Math.max(2, peaks[i] * (h - 14))
              c.fillStyle = i / peaks.length <= progress ? accent : wave
              c.fillRect(i * bar, (h - ph) / 2, Math.max(1, bar - 0.7), ph)
            }
            const x = progress * w
            c.fillStyle = accent
            c.fillRect(x - 1, 4, 2, h - 8)
            c.beginPath(); c.arc(x, h / 2, 4, 0, Math.PI * 2); c.fill()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [deck])

  return (
    <canvas
      ref={ref}
      className="waveform"
      onClick={(e) => {
        if (!deck.duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        deck.seek(((e.clientX - rect.left) / rect.width) * deck.duration)
      }}
      title="Tap to seek"
    />
  )
}
