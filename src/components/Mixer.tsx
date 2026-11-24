import { useEffect, useRef, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { getEngine } from '../audio/AudioEngine'

function Meter({ deckId }: { deckId: 0 | 1 }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const engine = getEngine()
    const analyser = engine.deck(deckId).analyser
    const data = new Uint8Array(analyser.frequencyBinCount)
    let raf = 0
    const tick = () => {
      analyser.getByteFrequencyData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) sum += data[i]
      const level = Math.min(100, (sum / data.length) * 1.6)
      if (ref.current) ref.current.style.height = `${level}%`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [deckId])
  return <div className="meter"><div className="meter-fill" ref={ref} /></div>
}

export function Mixer() {
  const engine = getEngine()
  const [xf, setXf] = useState(0.5)
  const [master, setMaster] = useState(0.9)
  const [volA, setVolA] = useState(1)
  const [volB, setVolB] = useState(1)

  return (
    <section className="mixer panel">
      <div className="mixer-title">MIXER</div>
      <div className="channels">
        <div className="channel">
          <Meter deckId={0} />
          <input className="v-fader" type="range" min={0} max={1.5} step={0.01} value={volA} onChange={(e) => { setVolA(+e.target.value); engine.deckA.setVolume(+e.target.value) }} aria-label="Deck A volume" />
          <span className="ch-label">A</span>
        </div>
        <div className="channel">
          <Meter deckId={1} />
          <input className="v-fader" type="range" min={0} max={1.5} step={0.01} value={volB} onChange={(e) => { setVolB(+e.target.value); engine.deckB.setVolume(+e.target.value) }} aria-label="Deck B volume" />
          <span className="ch-label">B</span>
        </div>
      </div>
      <div className="xf-zone">
        <div className="xf-labels"><span>A</span><span>B</span></div>
        <input className="x-fader" type="range" min={0} max={1} step={0.001} value={xf} onChange={(e) => { setXf(+e.target.value); engine.setCrossfader(+e.target.value) }} aria-label="Crossfader" />
        <button className="center-btn" onClick={() => { setXf(0.5); engine.setCrossfader(0.5) }}>CENTER</button>
      </div>
      <div className="master-zone">
        <Volume2 size={16} />
        <input className="v-fader short" type="range" min={0} max={1.5} step={0.01} value={master} onChange={(e) => { setMaster(+e.target.value); engine.setMaster(+e.target.value) }} aria-label="Master volume" />
        <span className="ch-label">MASTER</span>
      </div>
    </section>
  )
}
