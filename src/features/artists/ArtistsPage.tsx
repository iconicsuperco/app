import { User } from 'lucide-react'

export function ArtistsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Artists</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <User className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">No artists yet</h2>
        <p className="text-muse-text-secondary text-sm">Artists will appear as you add music</p>
      </div>
    </div>
  )
}
