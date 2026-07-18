import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { TrackRow } from './TrackRow'
import type { Track } from '@/types'

const track: Track = {
  id: 'track-1',
  blobId: 'blob-1',
  artistId: 'artist-radiohead',
  albumId: 'album-ok-computer-radiohead',
  title: 'Paranoid Android',
  artist: 'Radiohead',
  album: 'OK Computer',
  duration: 387,
  isFavorite: false,
  dateAdded: 0,
  playCount: 0,
}

function Location() {
  const { pathname } = useLocation()
  return <output data-testid="location">{pathname}</output>
}

describe('TrackRow navigation', () => {
  it('navigates to the persisted artist and album IDs', () => {
    render(
      <MemoryRouter>
        <Location />
        <TrackRow track={track} index={0} onPlay={() => undefined} />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: track.artist }))
    expect(screen.getByTestId('location').textContent).toBe(`/artist/${track.artistId}`)

    fireEvent.click(screen.getByRole('button', { name: track.album }))
    expect(screen.getByTestId('location').textContent).toBe(`/album/${track.albumId}`)
  })
})
