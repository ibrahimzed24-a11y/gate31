/** Generate a decaying-noise impulse response for a simple reverb. */
export function createImpulseResponse(ctx: AudioContext, seconds = 1.8, decay = 2.5): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds)
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
    }
  }
  return impulse
}
