import { Search as SearchIcon } from 'lucide-react'

export function SearchPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muse-text-muted" />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            className="w-full h-12 pl-12 pr-4 rounded-full bg-muse-bg-surface border border-muse-glass-border text-muse-text placeholder-muse-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-muse-accent focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-center text-muse-text-muted">
        <p className="text-sm">Search your library for songs, albums, and artists</p>
      </div>
    </div>
  )
}
