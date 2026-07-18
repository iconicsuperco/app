import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { QueuePanel } from './QueuePanel'
import { useQueueStore } from '@/player/QueueStore'
import { useUIStore } from '@/store/uiStore'

const queueData = vi.hoisted(() => ({
  tracks: [
    { id: 'track-1', blobId: 'blob-1', artistId: 'artist-1', title: 'Now playing', artist: 'Artist one', duration: 180, isFavorite: false, dateAdded: 0, playCount: 0 },
    { id: 'track-2', blobId: 'blob-2', artistId: 'artist-2', title: 'Up next', artist: 'Artist two', duration: 200, isFavorite: false, dateAdded: 0, playCount: 0 },
  ],
}))

const playerActions = vi.hoisted(() => ({ playFromQueue: vi.fn() }))

vi.mock('@/hooks/useCurrentTrack', () => ({ useCurrentTrack: () => queueData.tracks[0] }))
vi.mock('@/hooks/useArtwork', () => ({ useArtwork: () => null }))
vi.mock('@/hooks/useQueueTracks', () => ({ useQueueTracks: () => queueData.tracks }))
vi.mock('@/audio/PlayerController', () => ({ playerController: playerActions }))

describe('QueuePanel', () => {
  it('shows the current and upcoming tracks, jumps to a queued track, and closes', () => {
    useQueueStore.setState({ queue: ['track-1', 'track-2'], currentIndex: 0 })
    useUIStore.setState({ queueOpen: true })

    expect(useQueueStore.getState().queue).toEqual(['track-1', 'track-2'])
    expect(useQueueStore.getState().currentIndex).toBe(0)

    render(<QueuePanel />)

    expect(screen.getByText('Now Playing')).not.toBeNull()
    fireEvent.click(screen.getByText('Up next'))
    expect(playerActions.playFromQueue).toHaveBeenCalledWith(['track-1', 'track-2'], 'track-2')

    fireEvent.click(screen.getByRole('button', { name: 'Close queue' }))
    expect(useUIStore.getState().queueOpen).toBe(false)
  })
})
