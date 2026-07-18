/**
 * FFT analyser that feeds frequency + waveform data to visualizers.
 *
 * A single AnalyserNode sits in the audio graph (post-EQ, pre-destination)
 * so visualizations reflect the actual post-processing signal.
 */
export class Analyser {
  readonly node: AnalyserNode

  /** Frequency data buffer (0..255 per bin) */
  private freqBuffer: Uint8Array<ArrayBuffer>
  /** Waveform (time-domain) data buffer (0..255 per sample) */
  private waveBuffer: Uint8Array<ArrayBuffer>

  constructor(ctx: AudioContext) {
    this.node = ctx.createAnalyser()
    this.node.fftSize = 2048 // 1024 frequency bins
    this.node.smoothingTimeConstant = 0.82 // smooth, dreamy motion
    this.node.minDecibels = -85
    this.node.maxDecibels = -20

    this.freqBuffer = new Uint8Array(new ArrayBuffer(this.node.frequencyBinCount))
    this.waveBuffer = new Uint8Array(new ArrayBuffer(this.node.fftSize))
  }

  /** Get the current frequency spectrum (0..255 per bin, length = fftSize / 2). */
  getFrequencyData(): Uint8Array {
    this.node.getByteFrequencyData(this.freqBuffer)
    return this.freqBuffer
  }

  /** Get the current time-domain waveform (0..255 per sample). */
  getWaveformData(): Uint8Array {
    this.node.getByteTimeDomainData(this.waveBuffer)
    return this.waveBuffer
  }

  /**
   * Compute a compact "energy levels" array suitable for a bar visualizer.
   * Groups the raw bins into `bands` logarithmically (matches human hearing).
   * Returns normalized values (0..1).
   */
  getEnergyLevels(bands = 64): number[] {
    this.node.getByteFrequencyData(this.freqBuffer)
    const out = new Array<number>(bands).fill(0)
    const binCount = this.freqBuffer.length

    // Logarithmic mapping: each output band covers a proportionally wider bin range
    const logMin = Math.log2(1)
    const logMax = Math.log2(binCount)
    for (let i = 0; i < bands; i++) {
      const lo = Math.floor(Math.pow(2, logMin + ((logMax - logMin) * i) / bands))
      const hi = Math.floor(
        Math.pow(2, logMin + ((logMax - logMin) * (i + 1)) / bands),
      )
      let sum = 0
      let count = 0
      for (let b = lo; b < Math.max(hi, lo + 1) && b < binCount; b++) {
        sum += this.freqBuffer[b]!
        count++
      }
      out[i] = count > 0 ? sum / count / 255 : 0
    }
    return out
  }

  /** Overall RMS amplitude (0..1) — handy for pulsing UI on the beat. */
  getAmplitude(): number {
    this.node.getByteTimeDomainData(this.waveBuffer)
    let sum = 0
    for (let i = 0; i < this.waveBuffer.length; i++) {
      const v = (this.waveBuffer[i]! - 128) / 128
      sum += v * v
    }
    return Math.sqrt(sum / this.waveBuffer.length)
  }
}
