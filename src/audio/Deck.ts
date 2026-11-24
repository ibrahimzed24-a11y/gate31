import { computePeaks, detectBpm } from './analyze'
import { createImpulseResponse } from './effects'

export class Deck {
  readonly ctx: AudioContext
  readonly id: 0 | 1
  readonly analyser: AnalyserNode

  buffer: AudioBuffer | null = null
  peaks: number[] = []
  bpm = 0
  playing = false

  private source: AudioBufferSourceNode | null = null
  private startedAt = 0
  private offset = 0
  private rate = 1
  private stopping = false

  private eqLow: BiquadFilterNode
  private eqMid: BiquadFilterNode
  private eqHigh: BiquadFilterNode
  private filter: BiquadFilterNode
  private convolver: ConvolverNode
  private dry: GainNode
  private wet: GainNode
  private volume: GainNode
  private output: GainNode

  constructor(ctx: AudioContext, id: 0 | 1, output: GainNode) {
    this.ctx = ctx
    this.id = id
    this.output = output

    this.eqLow = ctx.createBiquadFilter(); this.eqLow.type = 'lowshelf'; this.eqLow.frequency.value = 250
    this.eqMid = ctx.createBiquadFilter(); this.eqMid.type = 'peaking'; this.eqMid.frequency.value = 1200; this.eqMid.Q.value = 0.8
    this.eqHigh = ctx.createBiquadFilter(); this.eqHigh.type = 'highshelf'; this.eqHigh.frequency.value = 4000
    this.filter = ctx.createBiquadFilter(); this.filter.type = 'lowpass'; this.filter.frequency.value = 20000
    this.convolver = ctx.createConvolver(); this.convolver.buffer = createImpulseResponse(ctx)
    this.dry = ctx.createGain(); this.dry.gain.value = 1
    this.wet = ctx.createGain(); this.wet.gain.value = 0
    this.volume = ctx.createGain(); this.volume.gain.value = 1
    this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 1024

    this.eqLow.connect(this.eqMid)
    this.eqMid.connect(this.eqHigh)
    this.eqHigh.connect(this.filter)
    this.filter.connect(this.dry)
    this.filter.connect(this.convolver)
    this.convolver.connect(this.wet)
    this.dry.connect(this.volume)
    this.wet.connect(this.volume)
    this.volume.connect(this.analyser)
    this.analyser.connect(this.output)
  }

  load(buffer: AudioBuffer, peaks?: number[], bpm?: number) {
    this.stop()
    this.buffer = buffer
    this.peaks = peaks ?? computePeaks(buffer)
    this.bpm = bpm ?? detectBpm(buffer)
    this.offset = 0
  }

  async play() {
    if (!this.buffer || this.playing) return
    await this.ctx.resume()
    const src = this.ctx.createBufferSource()
    src.buffer = this.buffer
    src.playbackRate.value = this.rate
    src.connect(this.eqLow)
    src.onended = () => {
      if (this.stopping) return
      this.playing = false
      this.offset = 0
      this.source = null
    }
    src.start(0, this.offset)
    this.startedAt = this.ctx.currentTime
    this.source = src
    this.playing = true
  }

  pause() {
    if (!this.playing) return
    this.offset = this.currentTime
    this.stop()
  }

  cue() {
    this.stop()
    this.offset = 0
    this.playing = false
  }

  seek(time: number) {
    const wasPlaying = this.playing
    this.stop()
    this.offset = Math.max(0, Math.min(time, this.duration))
    this.playing = false
    if (wasPlaying) void this.play()
  }

  private stop() {
    this.stopping = true
    if (this.source) {
      try { this.source.stop() } catch { /* already stopped */ }
      this.source.disconnect()
      this.source = null
    }
    this.playing = false
    this.stopping = false
  }

  get currentTime(): number {
    if (this.playing) return Math.min(this.offset + (this.ctx.currentTime - this.startedAt) * this.rate, this.duration)
    return this.offset
  }
  get duration(): number { return this.buffer?.duration ?? 0 }
  get progress(): number { return this.duration ? this.currentTime / this.duration : 0 }

  setEq(band: 'low' | 'mid' | 'high', db: number) {
    const node = band === 'low' ? this.eqLow : band === 'mid' ? this.eqMid : this.eqHigh
    node.gain.value = db
  }
  setFilter(cutoff: number, type: BiquadFilterType = 'lowpass') {
    this.filter.type = type
    this.filter.frequency.value = cutoff
  }
  setReverb(wet: number) { this.wet.gain.value = Math.max(0, Math.min(1, wet)) }
  setVolume(value: number) { this.volume.gain.value = Math.max(0, Math.min(1.5, value)) }
  nudge(seconds: number) { this.seek(this.currentTime + seconds) }
  setRate(rate: number) {
    if (this.playing) {
      const now = this.currentTime
      this.offset = now
      this.startedAt = this.ctx.currentTime
    }
    this.rate = Math.max(0.5, Math.min(2, rate))
    if (this.source) this.source.playbackRate.value = this.rate
  }
  get playbackRate() { return this.rate }
}
