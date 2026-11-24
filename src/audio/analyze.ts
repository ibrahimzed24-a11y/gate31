/** Downsample a buffer into N peak buckets for drawing a waveform. */
export function computePeaks(buffer: AudioBuffer, buckets = 600): number[] {
  const data = buffer.getChannelData(0)
  const step = Math.max(1, Math.floor(data.length / buckets))
  const peaks = new Array<number>(buckets).fill(0)
  for (let i = 0; i < buckets; i++) {
    const start = i * step
    let max = 0
    for (let j = 0; j < step && start + j < data.length; j++) {
      const v = Math.abs(data[start + j])
      if (v > max) max = v
    }
    peaks[i] = max
  }
  const ceiling = Math.max(0.001, ...peaks)
  return peaks.map((p) => p / ceiling)
}

/**
 * Lightweight BPM estimate: build an onset envelope from RMS energy,
 * then autocorrelate over plausible tempos (70–180 BPM).
 */
export function detectBpm(buffer: AudioBuffer): number {
  const sr = buffer.sampleRate
  const data = buffer.getChannelData(0)
  const hop = Math.floor(sr / 100) // 10 ms frames
  const frames = Math.floor(data.length / hop)
  if (frames < 20) return 0

  const energy = new Float32Array(frames)
  for (let i = 0; i < frames; i++) {
    let sum = 0
    const s = i * hop
    for (let j = 0; j < hop; j += 4) sum += data[s + j] * data[s + j]
    energy[i] = Math.sqrt(sum / (hop / 4))
  }
  const onset = new Float32Array(frames)
  for (let i = 1; i < frames; i++) onset[i] = Math.max(0, energy[i] - energy[i - 1])

  let bestLag = 0
  let bestScore = 0
  for (let bpm = 70; bpm <= 180; bpm++) {
    const lag = Math.round((60 / bpm) * 100) // frames per beat
    let score = 0
    for (let i = lag; i < onset.length; i++) score += onset[i] * onset[i - lag]
    if (score > bestScore) {
      bestScore = score
      bestLag = lag
    }
  }
  return bestLag ? Math.round(60 / (bestLag / 100)) : 0
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
