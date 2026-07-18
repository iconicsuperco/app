import { Music2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-8">
      {/* Hero section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Good evening
          </h1>
          <p className="text-muse-text-secondary mt-1">
            Your personal music library
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/import')}
          className="gap-2"
        >
          <Music2 className="w-4 h-4" />
          Add Music
        </Button>
      </div>

      {/* Welcome empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-blue-500/20 flex items-center justify-center mb-6">
          <Music2 className="w-10 h-10 text-muse-accent" />
        </div>
        <h2 className="text-xl font-semibold text-muse-text mb-2">
          Welcome to Muse
        </h2>
        <p className="text-muse-text-secondary max-w-md">
          Start building your library by adding your music files. Drag and drop audio
          files, or browse your computer to import songs.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/import')}
          className="mt-6 gap-2"
        >
          <Music2 className="w-4 h-4" />
          Add Music
        </Button>
      </div>

      {/* Shelf placeholders */}
      <div className="space-y-6">
        <ShelfPlaceholder title="Recently Added" />
        <ShelfPlaceholder title="Recently Played" />
      </div>
    </div>
  )
}

function ShelfPlaceholder({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2 group cursor-pointer">
            <div className="aspect-square rounded-lg bg-muse-bg-surface skeleton" />
            <div className="h-3 w-3/4 rounded bg-muse-bg-surface skeleton" />
            <div className="h-3 w-1/2 rounded bg-muse-bg-surface skeleton" />
          </div>
        ))}
      </div>
    </section>
  )
}
