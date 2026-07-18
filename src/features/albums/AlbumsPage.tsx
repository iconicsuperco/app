import { Disc3 } from 'lucide-react'

export function AlbumsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Albums</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Disc3 className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">No albums yet</h2>
        <p className="text-muse-text-secondary text-sm">Albums will appear as you add music</p>
      </div>
    </div>
  )
}
