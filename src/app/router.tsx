import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/features/home/HomePage'
import { SearchPage } from '@/features/search/SearchPage'
import { SongsPage } from '@/features/songs/SongsPage'
import { AlbumsPage } from '@/features/albums/AlbumsPage'
import { AlbumDetailPage } from '@/features/albums/AlbumDetailPage'
import { ArtistsPage } from '@/features/artists/ArtistsPage'
import { ArtistDetailPage } from '@/features/artists/ArtistDetailPage'
import { RecentlyAddedPage } from '@/features/recently-added/RecentlyAddedPage'
import { RecentlyPlayedPage } from '@/features/recently-played/RecentlyPlayedPage'
import { FavoritesPage } from '@/features/favorites/FavoritesPage'
import { PlaylistsPage } from '@/features/playlist/PlaylistsPage'
import { PlaylistDetailPage } from '@/features/playlist/PlaylistDetailPage'
import { ImportPage } from '@/features/import/ImportPage'
import { SettingsPage } from '@/features/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'songs', element: <SongsPage /> },
      { path: 'albums', element: <AlbumsPage /> },
      { path: 'album/:id', element: <AlbumDetailPage /> },
      { path: 'artists', element: <ArtistsPage /> },
      { path: 'artist/:id', element: <ArtistDetailPage /> },
      { path: 'recently-added', element: <RecentlyAddedPage /> },
      { path: 'recently-played', element: <RecentlyPlayedPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'playlists', element: <PlaylistsPage /> },
      { path: 'playlist/:id', element: <PlaylistDetailPage /> },
      { path: 'import', element: <ImportPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
