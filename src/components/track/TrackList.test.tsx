import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TrackList } from './TrackList'
import type { Track } from '@/types'

const virtualizerState = vi.hoisted(() => ({
  items: [] as { index: number; start: number }[],
}))

vi.mock('@tanstack/react-virtual', () => {
  const virtualizer = {
    getVirtualItems: () => virtualizerState.items,
    getTotalSize: () => virtualizerState.items.length * 56,
  }

  return { useVirtualizer: () => virtualizer }
})

const track: Track = {
  id: 'track-1',
  blobId: 'blob-1',
  artistId: 'artist-1',
  albumId: 'album-1',
  title: 'Visible track',
  artist: 'Artist',
  album: 'Album',
  duration: 180,
  isFavorite: false,
  dateAdded: 0,
  playCount: 0,
}

describe('TrackList', () => {
  it('renders rows into the DOM after the virtualizer measures its viewport', () => {
    virtualizerState.items = []
    const { container, rerender } = render(
      <MemoryRouter>
        <div style={{ height: 300 }}>
          <TrackList tracks={[track]} onPlayTrack={() => undefined} />
        </div>
      </MemoryRouter>,
    )

    expect(screen.queryByText(track.title)).toBeNull()

    virtualizerState.items = [{ index: 0, start: 0 }]
    rerender(
      <MemoryRouter>
        <div style={{ height: 300 }}>
          <TrackList tracks={[track]} onPlayTrack={() => undefined} />
        </div>
      </MemoryRouter>,
    )

    expect(container.querySelector('.h-full')).not.toBeNull()
    expect(screen.getByText(track.title)).not.toBeNull()
  })
})
