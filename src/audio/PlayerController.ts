import { audioEngine } from './AudioEngine'
import { usePlayerStore } from '@/player/PlayerStore'
import { useQueueStore } from '@/player/QueueStore'
import { useUIStore } from '@/store/uiStore'
import { db } from '@/library/db'
import type { Track } from '@/types'

/**
 * PlayerController — the single coordinator between the audio engine,
 * the player/queue stores, and IndexedDB.
 *
 * The UI never touches audioEngine directly. Instead it calls these
 * high-level methods (playTrack, playFromQueue, etc.). The controller:
 *   1. Resolves the track from IndexedDB (by id)
 *   2. Creates an object URL for the stored Blob
 *   3. Loads it into the engine
 *   4. Updates the stores + Media Session metadata
 *   5. Handles "track ended" → advance / repeat / stop
 *
 * This keeps engine ↔ store ↔ DB wiring in exactly one place.
 */
class PlayerControllerImpl {
  private currentObjectUrl: string | null = null
  private bound = false
  private currentMediaSessionArtworkUrl: string | null = null

  /** Wire engine events to the stores. Idempotent — safe to call multiple times. */
  init(): void {
    if (this.bound) return
    this.bound = true

    audioEngine.onStatus((s) => {
      const store = usePlayerStore.getState()
      store.setStatus(s)

      // When a track starts playing, record it in history + bump play count
      if (s === 'playing' && store.currentTrackId) {
        this.recordPlay(store.currentTrackId)
      }
    })

    audioEngine.onPosition((pos) => {
      usePlayerStore.getState().setPosition(pos)
    })

    audioEngine.onDuration((d) => {
      usePlayerStore.getState().setDuration(d)
    })

    // Track ended → advance based on repeat / queue state
    audioEngine.onEnded(() => {
      this.handleTrackEnded()
    })
  }

  // ─── Transport (delegated to engine) ────────────────────────

  async play(): Promise<void> {
    await audioEngine.play()
  }

  pause(): void {
    audioEngine.pause()
  }

  async togglePlayPause(): Promise<void> {
    await audioEngine.togglePlayPause()
  }

  seek(time: number): void {
    audioEngine.seek(time)
  }

  seekBy(offset: number): void {
    audioEngine.seekBy(offset)
  }

  // ─── Queue control ─────────────────────────────────────────

  /**
   * Replace the queue and start playing from a given track.
   *
   * @param trackIds Ordered list of track ids that will form the new queue.
   * @param startTrackId The track within the list to start at (defaults to first).
   */
  async playFromQueue(trackIds: string[], startTrackId?: string): Promise<void> {
    const startIndex = startTrackId ? trackIds.indexOf(startTrackId) : 0
    useQueueStore.getState().setQueue(trackIds, Math.max(0, startIndex))
    await this.playCurrent()
  }

  /** Add a track to play next (right after the current track). */
  playNext(trackId: string): void {
    useQueueStore.getState().addToQueue(trackId, 'next')
    useUIStore.getState().addToast('Added to queue', 'success')
  }

  /** Add a track to the end of the queue. */
  addToQueue(trackId: string): void {
    useQueueStore.getState().addToQueue(trackId, 'end')
    useUIStore.getState().addToast('Added to queue', 'success')
  }

  /** Skip to the next track in the queue (respects repeat). */
  async next(): Promise<void> {
    const nextId = useQueueStore.getState().next()
    if (nextId) {
      await this.playTrackById(nextId)
    } else {
      this.stop()
    }
  }

  /** Go to the previous track (or restart current if early in playback). */
  async previous(): Promise<void> {
    // If we're more than 3 seconds into the track, restart it instead
    const { position } = usePlayerStore.getState()
    if (position > 3) {
      this.seek(0)
      return
    }
    const prevId = useQueueStore.getState().previous()
    if (prevId) {
      await this.playTrackById(prevId)
    }
  }

  // ─── Internal helpers ──────────────────────────────────────

  /** Load + play the track at the queue's current index. */
  private async playCurrent(): Promise<void> {
    const trackId = useQueueStore.getState().getCurrentTrackId()
    if (!trackId) return
    await this.playTrackById(trackId)
  }

  /** Load a track by id, create its object URL, and start playback. */
  private async playTrackById(trackId: string): Promise<void> {
    const track = await db.tracks.get(trackId)
    if (!track) {
      console.warn(`PlayerController: track ${trackId} not found`)
      return
    }

    // Revoke the previous object URL to avoid leaking memory
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl)
    }

    const blobRecord = await db.audioBlobs.get(track.blobId)
    if (!blobRecord) {
      console.warn(`PlayerController: audio blob ${track.blobId} not found`)
      useUIStore.getState().addToast('Audio file missing', 'error')
      return
    }

    this.currentObjectUrl = URL.createObjectURL(blobRecord.blob)
    audioEngine.load(this.currentObjectUrl)

    usePlayerStore.getState().setCurrentTrack(trackId)
    await audioEngine.play()

    this.updateMediaSession(track)
  }

  /** Decide what to do when the current track ends. */
  private async handleTrackEnded(): Promise<void> {
    const { repeatMode } = usePlayerStore.getState()

    if (repeatMode === 'one') {
      // Repeat the same track
      audioEngine.seek(0)
      await audioEngine.play()
      return
    }

    // For 'off' and 'all', QueueStore.next() / PlayerController.next()
    // decide whether to stop or continue.
    await this.next()
  }

  private stop(): void {
    audioEngine.pause()
    audioEngine.seek(0)
    usePlayerStore.getState().setStatus('idle')
  }

  /** Insert a play record + bump play count. */
  private async recordPlay(trackId: string): Promise<void> {
    await db.playHistory.add({
      id: crypto.randomUUID(),
      trackId,
      playedAt: Date.now(),
    })
    const track = await db.tracks.get(trackId)
    if (track) {
      await db.tracks.update(trackId, {
        lastPlayed: Date.now(),
        playCount: (track.playCount ?? 0) + 1,
      })
    }
  }

  /** Populate OS-level Media Session (lock screen, hardware keys). */
  private async updateMediaSession(track: Track): Promise<void> {
    if (!('mediaSession' in navigator)) return

    // Revoke previous artwork URL to avoid leaking object URLs
    if (this.currentMediaSessionArtworkUrl) {
      try {
        URL.revokeObjectURL(this.currentMediaSessionArtworkUrl)
      } catch {
        // ignore
      }
      this.currentMediaSessionArtworkUrl = null
    }

    // Best-effort: attach artwork if we have a stored blob
    let artwork: MediaImage[] = []
    if (track.artworkId) {
      try {
        const artBlob = await db.artworkBlobs.get(track.artworkId)
        if (artBlob) {
          this.currentMediaSessionArtworkUrl = URL.createObjectURL(artBlob.blob)
          artwork = [
            {
              src: this.currentMediaSessionArtworkUrl,
              sizes: '512x512',
            },
          ]
        }
      } catch {
        // Non-fatal — Media Session works without artwork
      }
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album ?? '',
      artwork: artwork.length ? artwork : undefined,
    })

    navigator.mediaSession.setActionHandler('play', () => this.play())
    navigator.mediaSession.setActionHandler('pause', () => this.pause())
    navigator.mediaSession.setActionHandler('previoustrack', () => this.previous())
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next())
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) this.seek(details.seekTime)
    })
  }
}

export const playerController = new PlayerControllerImpl()
