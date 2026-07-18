import { Clock } from 'lucide-react'

export function RecentlyAddedPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recently Added</h1>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Clock className="w-12 h-12 text-muse-text-muted mb-4" />
        <h2 className="text-lg font-semibold text-muse-text mb-2">Nothing recently added</h2>
        <p className="text-muse-text-secondary text-sm">New imports will show up here</p>
      </div>
    </div>
  )
}
