import { Music2, FolderUp, Upload } from 'lucide-react'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

const ACCEPTED_FORMATS = [
  '.mp3', '.m4a', '.flac', '.ogg', '.opus', '.wav', '.wma', '.aac', '.webm',
]

export function ImportPage() {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    // Phase 1: will connect to import pipeline
    const files = Array.from(e.dataTransfer.files)
    console.log('Dropped files:', files.map((f) => f.name))
  }, [])

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = ACCEPTED_FORMATS.join(',')
    // Phase 1: will connect to import pipeline
    input.onchange = () => {
      if (input.files) {
        const files = Array.from(input.files)
        console.log('Selected files:', files.map((f) => f.name))
      }
    }
    input.click()
  }, [])

  const handleFolderSelect = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.multiple = true
    // Phase 1: will connect to import pipeline
    input.onchange = () => {
      if (input.files) {
        const files = Array.from(input.files).filter((f) =>
          ACCEPTED_FORMATS.some((ext) => f.name.toLowerCase().endsWith(ext)),
        )
        console.log('Selected folder files:', files.map((f) => f.name))
      }
    }
    input.click()
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Music</h1>
        <p className="text-muse-text-secondary mt-1">
          Import your music files to start listening
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-200',
          'flex flex-col items-center justify-center py-16 px-6 cursor-pointer',
          isDragging
            ? 'border-muse-accent bg-muse-accent-subtle scale-[1.01]'
            : 'border-muse-glass-border bg-muse-bg-surface hover:border-muse-text-muted hover:bg-muse-bg-hover',
        )}
        onClick={handleFileSelect}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDragging ? 'active' : 'idle'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center transition-colors',
              isDragging
                ? 'bg-muse-accent/20 text-muse-accent'
                : 'bg-muse-bg-hover text-muse-text-muted',
            )}>
              <Music2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-medium text-muse-text">
                {isDragging ? 'Drop your files here' : 'Drag and drop audio files'}
              </p>
              <p className="text-sm text-muse-text-muted mt-1">
                or click to browse your computer
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Supported formats */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {ACCEPTED_FORMATS.map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-muse-bg-hover text-muse-text-muted"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Alternative import options */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={handleFileSelect}
          className="gap-2 justify-center"
        >
          <Upload className="w-4 h-4" />
          Select Files
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleFolderSelect}
          className="gap-2 justify-center"
        >
          <FolderUp className="w-4 h-4" />
          Select Folder
        </Button>
      </div>

      <p className="text-xs text-muse-text-muted text-center">
        Metadata (title, artist, album, artwork) is automatically extracted when available.
        Files are stored locally in your browser.
      </p>
    </div>
  )
}
