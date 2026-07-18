import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { NowPlayingView } from './NowPlayingView'
import { usePlayerStore } from '@/player/PlayerStore'
import { useUIStore } from '@/store/uiStore'

const track = vi.hoisted(() => ({
  id: 'track-1',
  blobId: 'blob-1',
  artistId: 'artist-1',
  albumId: 'album-1',
  title: 'Current song',
  artist: 'Current artist',
  album: 'Current album',
  duration: 180,
  isFavorite: false,
  dateAdded: 0,
  playCount: 0,
  palette: { vibrant: '#8b5cf6', muted: '#4c1d95', dark: '#1e1b4b', light: '#ddd6fe' },
}))

const playerActions = vi.hoisted(() => ({
  seek: vi.fn(),
  previous: vi.fn(),
  next: vi.fn(),
  togglePlayPause: vi.fn(),
}))

vi.mock('@/hooks/useCurrentTrack', () => ({ useCurrentTrack: () => track }))
vi.mock('@/hooks/useArtwork', () => ({ useArtwork: () => null }))
vi.mock('@/library/queries', () => ({ toggleFavorite: vi.fn() }))
vi.mock('@/audio/PlayerController', () => ({ playerController: playerActions }))

vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
})

function Location() {
  const { pathname } = useLocation()
  return <output data-testid="location">{pathname}</output>
}

describe('NowPlayingView', () => {
  it('navigates from track metadata, closes the overlay, and uses controller transport', () => {
    useUIStore.setState({ nowPlayingOpen: true })
    usePlayerStore.setState({ currentTrackId: track.id, status: 'paused', position: 15, duration: track.duration })

    render(
      <MemoryRouter>
        <Location />
        <NowPlayingView />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: track.artist }))
    expect(screen.getByTestId('location').textContent).toBe(`/artist/${track.artistId}`)
    expect(useUIStore.getState().nowPlayingOpen).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Next track' }))
    expect(playerActions.next).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Close now playing' }))
    expect(useUIStore.getState().nowPlayingOpen).toBe(false)
  })
})
