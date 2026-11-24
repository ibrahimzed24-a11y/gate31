import { useEffect, useRef } from 'react'
import type { Deck } from '../audio/Deck'

export function Waveform({ deck, color }: { deck: Deck; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let raf = 0
    const draw = () => {
      const canvas = ref.current
      if (canvas) {
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
          c.fillStyle = 'rgba(255,255,255,0.035)'
          c.fillRect(0, 0, w, h)
          const peaks = deck.peaks
          if (peaks.length) {
            const bar = w / peaks.length
            const progress = deck.progress
            for (let i = 0; i < peaks.length; i++) {
              const ph = Math.max(2, peaks[i] * (h - 8))
              c.fillStyle = i / peaks.length <= progress ? color : 'rgba(255,255,255,0.18)'
              c.fillRect(i * bar, (h - ph) / 2, Math.max(1, bar - 0.6), ph)
            }
            const x = progress * w
            c.fillStyle = '#ffffff'
            c.fillRect(x - 1, 0, 2, h)
            c.beginPath(); c.arc(x, h / 2, 5, 0, Math.PI * 2); c.fill()
          } else {
            c.fillStyle = 'rgba(255,255,255,0.25)'
            c.font = '12px system-ui'
            c.textAlign = 'center'
            c.fillText('Load a track to see its waveform', w / 2, h / 2 + 4)
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [deck, color])

  return (
    <canvas
      ref={ref}
      className="waveform"
      onClick={(e) => {
        if (!deck.duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        deck.seek(((e.clientX - rect.left) / rect.width) * deck.duration)
      }}
      title="Click to seek"
    />
  )
}
