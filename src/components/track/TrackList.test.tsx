import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TrackList } from './TrackList'
import type { Track } from '@/types'

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => [{ index: 0, start: 0 }],
    getTotalSize: () => 56,
  }),
}))

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
  it('fills its sized parent and renders virtualized track rows into the DOM', () => {
    const { container } = render(
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
