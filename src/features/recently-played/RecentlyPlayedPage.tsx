import { ListMusic } from 'lucide-react'

export function RecentlyPlayedPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recently Played</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ListMusic className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">No play history</h2>
        <p className="text-muse-text-secondary text-sm">Songs you listen to will appear here</p>
      </div>
    </div>
  )
}
