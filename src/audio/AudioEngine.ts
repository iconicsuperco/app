import { Equalizer } from './Equalizer'
import { Analyser } from './Analyser'
import type { PlaybackStatus } from '@/types'

/**
 * AudioEngine — the central Web Audio graph for Muse.
 *
 *     <audio> → MediaElementSource → Equalizer → Analyser → PreAmp Gain → Destination
 *
 * Responsibilities:
 *  - Own the single AudioContext + <audio> element (autoplay-policy compliant)
 *  - Apply EQ, feed the analyser, control master volume
 *  - Emit status / position / duration events to subscribers
 *  - Cooperate with the Media Session API (set externally)
 *
 * The engine is a singleton — there is exactly one AudioContext per page.
 */
class AudioEngineImpl {
  private ctx: AudioContext | null = null
  private audio: HTMLAudioElement
  private source: MediaElementAudioSourceNode | null = null
  private preAmp: GainNode | null = null

  readonly equalizer: Equalizer | null = null
  readonly analyser: Analyser | null = null

  private volume = 0.75
  private muted = false
  private playbackRate = 1

  // Event subscribers
  private statusListeners = new Set<(s: PlaybackStatus) => void>()
  private positionListeners = new Set<(pos: number) => void>()
  private durationListeners = new Set<(d: number) => void>()
  private endedListeners = new Set<() => void>()

  private rafId: number | null = null

  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'auto'
    this.audio.crossOrigin = 'anonymous'
    this.attachElementEvents()
  }

  // ─── Initialization ──────────────────────────────────────────

  /**
   * Lazily create the AudioContext + graph on first user interaction.
   * Browsers require a user gesture before audio can play.
   */
  private ensureContext(): void {
    if (this.ctx) return
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctor()

    this.preAmp = this.ctx.createGain()
    this.preAmp.gain.value = this.muted ? 0 : this.volume

    // Type-cast to attach the mutable instances (initialized exactly once here)
    const eq = new Equalizer(this.ctx)
    const an = new Analyser(this.ctx)
    ;(this as { equalizer: Equalizer }).equalizer = eq
    ;(this as { analyser: Analyser }).analyser = an

    this.source = this.ctx.createMediaElementSource(this.audio)

    // Final graph: source → EQ → analyser → preAmp → destination
    this.source.connect(eq.input)
    eq.output.connect(an.node)
    an.node.connect(this.preAmp)
    this.preAmp.connect(this.ctx.destination)
  }

  private attachElementEvents(): void {
    this.audio.addEventListener('playing', () => {
      this.emitStatus('playing')
      this.startPositionLoop()
    })
    this.audio.addEventListener('pause', () => {
      this.stopPositionLoop()
      // Don't emit 'paused' if we hit the end — 'ended' handles that
      if (!this.audio.ended) this.emitStatus('paused')
    })
    this.audio.addEventListener('loadstart', () => this.emitStatus('loading'))
    this.audio.addEventListener('waiting', () => this.emitStatus('loading'))
    this.audio.addEventListener('canplay', () => {
      this.emitDuration(this.audio.duration)
    })
    this.audio.addEventListener('durationchange', () => {
      this.emitDuration(this.audio.duration)
    })
    this.audio.addEventListener('ended', () => {
      this.stopPositionLoop()
      this.emitStatus('ended')
      this.emitEnded()
    })
    this.audio.addEventListener('error', () => {
      this.emitStatus('error')
    })
  }

  // ─── Public API: loading & transport ────────────────────────

  /** Load a track by object URL (created from an IndexedDB Blob). */
  load(src: string): void {
    this.ensureContext()
    if (this.audio.src !== src) {
      this.audio.src = src
      this.audio.load()
    }
  }

  async play(): Promise<void> {
    this.ensureContext()
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    try {
      await this.audio.play()
    } catch (err) {
      // Autoplay rejection — surface as error status
      console.warn('AudioEngine: play() rejected', err)
      this.emitStatus('error')
    }
  }

  pause(): void {
    this.audio.pause()
  }

  /** Toggle play/pause. Returns the resulting status. */
  async togglePlayPause(): Promise<void> {
    if (this.audio.paused) {
      await this.play()
    } else {
      this.pause()
    }
  }

  seek(time: number): void {
    if (isFinite(time)) {
      this.audio.currentTime = Math.max(0, time)
      this.emitPosition(this.audio.currentTime)
    }
  }

  /** Seek by a relative offset (positive or negative seconds). */
  seekBy(offset: number): void {
    this.seek(this.audio.currentTime + offset)
  }

  // ─── Public API: properties ─────────────────────────────────

  getPosition(): number {
    return this.audio.currentTime
  }

  getDuration(): number {
    return this.audio.duration
  }

  getBuffered(): number {
    const { buffered, duration } = this.audio
    if (buffered.length === 0 || !duration) return 0
    return buffered.end(buffered.length - 1) ?? 0
  }

  getStatus(): PlaybackStatus {
    if (this.audio.error) return 'error'
    if (this.audio.ended) return 'ended'
    if (this.audio.paused) return this.audio.currentTime > 0 ? 'paused' : 'idle'
    return 'playing'
  }

  // ─── Public API: volume & rate ──────────────────────────────

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    this.muted = false
    if (this.preAmp && this.ctx) {
      this.preAmp.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.015)
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.preAmp && this.ctx) {
      this.preAmp.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.015)
    }
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate = rate
    this.audio.playbackRate = rate
  }

  getPlaybackRate(): number {
    return this.playbackRate
  }

  // ─── Position loop ─────────────────────────────────────────

  private startPositionLoop(): void {
    if (this.rafId !== null) return
    const tick = () => {
      this.emitPosition(this.audio.currentTime)
      this.rafId = requestAnimationFrame(tick)
    }
    this.rafId = requestAnimationFrame(tick)
  }

  private stopPositionLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  // ─── Event subscription ────────────────────────────────────

  onStatus(cb: (s: PlaybackStatus) => void): () => void {
    this.statusListeners.add(cb)
    return () => this.statusListeners.delete(cb)
  }
  onPosition(cb: (pos: number) => void): () => void {
    this.positionListeners.add(cb)
    return () => this.positionListeners.delete(cb)
  }
  onDuration(cb: (d: number) => void): () => void {
    this.durationListeners.add(cb)
    return () => this.durationListeners.delete(cb)
  }
  onEnded(cb: () => void): () => void {
    this.endedListeners.add(cb)
    return () => this.endedListeners.delete(cb)
  }

  private emitStatus(s: PlaybackStatus): void {
    this.statusListeners.forEach((cb) => cb(s))
  }
  private emitPosition(pos: number): void {
    this.positionListeners.forEach((cb) => cb(pos))
  }
  private emitDuration(d: number): void {
    this.durationListeners.forEach((cb) => cb(d))
  }
  private emitEnded(): void {
    this.endedListeners.forEach((cb) => cb())
  }
}

/** Singleton — exactly one AudioContext per page. */
export const audioEngine = new AudioEngineImpl()
