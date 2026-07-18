import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { useUIStore } from '@/store/uiStore'

export function TopBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleSidebar } = useUIStore()

  const canGoBack = window.history.length > 1

  return (
    <header className="flex items-center gap-3 h-14 px-4 shrink-0 z-10">
      {/* Navigation controls */}
      <div className="flex items-center gap-1">
        <Tooltip content="Go back" side="bottom">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!canGoBack}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Go forward" side="bottom">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(1)}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-muse-text truncate">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Right actions placeholder */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="text-muse-text-muted hover:text-muse-text"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/': 'Home',
    '/search': 'Search',
    '/recently-added': 'Recently Added',
    '/recently-played': 'Recently Played',
    '/favorites': 'Favorites',
    '/songs': 'Songs',
    '/albums': 'Albums',
    '/artists': 'Artists',
    '/playlists': 'Playlists',
    '/settings': 'Settings',
    '/import': 'Add Music',
  }
  // Dynamic routes
  if (pathname.startsWith('/album/')) return 'Album'
  if (pathname.startsWith('/artist/')) return 'Artist'
  if (pathname.startsWith('/playlist/')) return 'Playlist'
  return titles[pathname] ?? 'Muse'
}
