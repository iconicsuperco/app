import { EQ_BAND_FREQUENCIES } from '@/store/settingsStore'

const FILTER_TYPES: BiquadFilterType[] = [
  'lowshelf',
  'peaking',
  'peaking',
  'peaking',
  'peaking',
  'peaking',
  'peaking',
  'peaking',
  'peaking',
  'highshelf',
]

/**
 * 10-band graphic equalizer built from a chain of BiquadFilterNodes.
 *
 * Graph: input → band[0] → band[1] → … → band[9] → output
 *
 * Each band is centered on a standard ISO frequency (32Hz → 16kHz).
 * The first/last bands are shelves, the rest are peaking filters.
 */
export class Equalizer {
  /** Input node — connect source here */
  readonly input: GainNode
  /** Output node — connect to downstream (analyser / destination) */
  readonly output: GainNode

  private readonly filters: BiquadFilterNode[] = []
  private readonly ctx: AudioContext
  private enabled = false

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.input = ctx.createGain()
    this.output = ctx.createGain()

    // Build filter chain
    for (let i = 0; i < EQ_BAND_FREQUENCIES.length; i++) {
      const freq = EQ_BAND_FREQUENCIES[i]!
      const filter = ctx.createBiquadFilter()
      filter.type = FILTER_TYPES[i]!
      filter.frequency.value = freq
      filter.Q.value = 1.0 // gentle resonance
      filter.gain.value = 0 // flat by default
      this.filters.push(filter)
    }

    // Wire the chain: input → f0 → f1 → … → f9 → output
    let prev: AudioNode = this.input
    for (const f of this.filters) {
      prev.connect(f)
      prev = f
    }
    prev.connect(this.output)
  }

  /** Set gain (dB, -12..+12) for a single band index (0..9). */
  setBand(index: number, gainDb: number): void {
    const filter = this.filters[index]
    if (!filter) return
    filter.gain.setTargetAtTime(this.enabled ? gainDb : 0, this.ctx.currentTime, 0.02)
  }

  /** Apply all 10 band gains at once. */
  setBands(gains: number[]): void {
    for (let i = 0; i < this.filters.length; i++) {
      const g = gains[i] ?? 0
      this.setBand(i, g)
    }
  }

  /** Enable or bypass the EQ. When bypassed, all filters return to 0 dB. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    // Re-apply current gains (or zero them when bypassed)
    for (const f of this.filters) {
      f.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02)
    }
  }

  /** Current enabled state. */
  isEnabled(): boolean {
    return this.enabled
  }

  getBands(): number[] {
    return this.filters.map((f) => f.gain.value)
  }
}
