import { useEffect, useState } from 'react'
import { Circle, Download, Radio, CloudOff } from 'lucide-react'
import { getEngine } from './audio/AudioEngine'
import { cloudEnabled } from './lib/supabase'
import { DeckView } from './components/DeckView'
import { Library } from './components/Library'
import { Mixer } from './components/Mixer'

export default function App() {
  const engine = getEngine()
  const [recording, setRecording] = useState(false)
  const [audioReady, setAudioReady] = useState(false)

  useEffect(() => {
    const unlock = () => { void engine.resume().then(() => setAudioReady(true)) }
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock) }
  }, [engine])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return
      if (e.key.toLowerCase() === 'q') void (engine.deckA.playing ? engine.deckA.pause() : engine.deckA.play())
      if (e.key.toLowerCase() === 'p') void (engine.deckB.playing ? engine.deckB.pause() : engine.deckB.play())
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [engine])

  const toggleRecord = async () => {
    if (recording) {
      const blob = await engine.stopRecording()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `gate31-mix-${Date.now()}.webm`; a.click()
      URL.revokeObjectURL(url)
      setRecording(false)
    } else {
      await engine.resume()
      engine.startRecording()
      setRecording(true)
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">31</div>
          <div><h1>GATE 31</h1><span>DJ STUDIO</span></div>
        </div>
        <div className="top-status">
          <span className={`dot ${audioReady ? 'ok' : ''}`} /> {audioReady ? 'Audio ready' : 'Click anywhere to enable audio'}
          {!cloudEnabled && <span className="cloud-note"><CloudOff size={13} /> Local mode</span>}
        </div>
        <button className={`record ${recording ? 'active' : ''}`} onClick={() => void toggleRecord()}>
          {recording ? <><Radio size={16} /> STOP &amp; SAVE</> : <><Circle size={15} /> RECORD MIX</>}
          {recording && <Download size={14} />}
        </button>
      </header>

      <main className="stage">
        <DeckView id={0} />
        <Mixer />
        <DeckView id={1} />
      </main>

      <Library />

      <footer className="footer">GATE 31 · v0.1.0 · Built with Web Audio · <span>Made for the booth</span></footer>
    </div>
  )
}
