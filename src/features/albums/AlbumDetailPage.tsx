import { useParams } from 'react-router-dom'

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Album</h1>
      <p className="text-muse-text-muted text-sm">ID: {id ?? 'unknown'}</p>
      <div className="flex flex-col items-center justify-center py-16 text-center text-muse-text-muted">
        <p className="text-sm">Album detail page coming in Phase 2</p>
      </div>
    </div>
  )
}
