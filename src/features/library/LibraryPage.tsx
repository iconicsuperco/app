import { Search } from 'lucide-react'

export function LibraryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Library</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">Library coming soon</h2>
        <p className="text-muse-text-secondary text-sm">Browse your complete music library</p>
      </div>
    </div>
  )
}
