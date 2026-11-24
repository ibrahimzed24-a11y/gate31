import { Deck } from './Deck'

class AudioEngine {
  readonly ctx: AudioContext
  readonly master: GainNode
  readonly xfA: GainNode
  readonly xfB: GainNode
  readonly deckA: Deck
  readonly deckB: Deck
  readonly recorderDest: MediaStreamAudioDestinationNode

  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []

  constructor() {
    this.ctx = new AudioContext()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.9
    this.xfA = this.ctx.createGain()
    this.xfB = this.ctx.createGain()
    this.xfA.connect(this.master)
    this.xfB.connect(this.master)
    this.master.connect(this.ctx.destination)
    this.recorderDest = this.ctx.createMediaStreamDestination()
    this.master.connect(this.recorderDest)
    this.deckA = new Deck(this.ctx, 0, this.xfA)
    this.deckB = new Deck(this.ctx, 1, this.xfB)
    this.setCrossfader(0.5)
  }

  deck(id: 0 | 1): Deck { return id === 0 ? this.deckA : this.deckB }

  /** 0 = full A, 0.5 = center, 1 = full B (equal-power curve). */
  setCrossfader(value: number) {
    const v = Math.max(0, Math.min(1, value))
    this.xfA.gain.value = Math.cos(v * Math.PI * 0.5)
    this.xfB.gain.value = Math.sin(v * Math.PI * 0.5)
  }
  setMaster(value: number) { this.master.gain.value = Math.max(0, Math.min(1.5, value)) }
  async resume() { if (this.ctx.state === 'suspended') await this.ctx.resume() }
  async decode(file: File): Promise<AudioBuffer> { return this.ctx.decodeAudioData(await file.arrayBuffer()) }

  startRecording() {
    if (this.recorder) return
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : ''
    this.chunks = []
    this.recorder = new MediaRecorder(this.recorderDest.stream, mime ? { mimeType: mime } : undefined)
    this.recorder.ondataavailable = (e) => { if (e.data.size) this.chunks.push(e.data) }
    this.recorder.start(250)
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder) { resolve(new Blob()); return }
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.chunks[0]?.type || 'audio/webm' })
        this.recorder = null
        this.chunks = []
        resolve(blob)
      }
      this.recorder.stop()
    })
  }
  get isRecording() { return this.recorder !== null }
}

let instance: AudioEngine | null = null
export function getEngine(): AudioEngine {
  if (!instance) instance = new AudioEngine()
  return instance
}
