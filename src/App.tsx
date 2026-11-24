import { useEffect, useState } from 'react'
import { Download, Radio, Circle } from 'lucide-react'
import { getEngine } from './audio/AudioEngine'
import { cloudEnabled } from './lib/supabase'
import { DeckView } from './components/DeckView'
import { Library } from './components/Library'
import { Mixer } from './components/Mixer'

type Theme = 'system' | 'light' | 'dark'

export default function App() {
  const engine = getEngine()
  const [recording, setRecording] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('g31-theme') as Theme) || 'system')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme
    }
    apply()
    localStorage.setItem('g31-theme', theme)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

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
          <div className="eq-logo"><i /><i /><i /></div>
          <div><h1>GATE <b>31</b></h1><span>DJ STUDIO</span></div>
        </div>
        <div className="header-right">
          <div className="status-pill pill">
            <span className={`dot ${audioReady ? 'ok' : ''}`} />
            {audioReady ? 'Audio ready' : 'Click to enable audio'}
            {!cloudEnabled && ' · Local mode'}
          </div>
          <div className="theme-pill pill">
            <span>Theme:</span>
            {(['system', 'light', 'dark'] as Theme[]).map((t) => (
              <button key={t} className={theme === t ? 'active' : ''} onClick={() => setTheme(t)}>{t}</button>
            ))}
          </div>
          <button className={`record-pill ${recording ? 'active' : ''}`} onClick={() => void toggleRecord()}>
            {recording ? <><Radio size={15} /> STOP &amp; SAVE <Download size={14} /></> : <><Circle size={14} /> RECORD MIX</>}
          </button>
        </div>
      </header>

      <main className="stage">
        <DeckView id={0} />
        <Mixer />
        <DeckView id={1} />
      </main>

      <Library />
      <footer className="footer">GATE 31 · v0.1.0 · WEB AUDIO ENGINE · MADE FOR THE BOOTH</footer>
    </div>
  )
}
