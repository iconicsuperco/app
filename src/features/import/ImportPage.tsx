import { Music2, FolderUp, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { importFiles } from '@/library/import/importFiles'
import { useUIStore } from '@/store/uiStore'
import type { ImportProgress } from '@/types'

const ACCEPTED_FORMATS = [
  '.mp3', '.m4a', '.flac', '.ogg', '.opus', '.wav', '.wma', '.aac', '.webm',
]

export function ImportPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const navigate = useNavigate()
  const addToast = useUIStore((s) => s.addToast)

  const runImport = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      setIsImporting(true)
      setProgress({
        total: files.length,
        completed: 0,
        failed: 0,
        errors: [],
      })
      try {
        const result = await importFiles(files, (p) => setProgress(p))
        if (result.imported > 0) {
          addToast(`Imported ${result.imported} song${result.imported === 1 ? '' : 's'}`, 'success')
        }
        if (result.failed > 0) {
          const firstError = result.errors[0]?.error || 'Unknown error'
          addToast(`${result.failed} file(s) failed to import: ${firstError}`, 'error')
        }
        if (result.imported > 0 && result.failed === 0) {
          // Head to the Songs page to see them
          setTimeout(() => navigate('/songs'), 600)
        }
      } catch (err) {
        console.error('Import failed', err)
        const message = err instanceof Error ? err.message : String(err)
        addToast(`Import failed: ${message || 'Unknown error'}`, 'error')
      } finally {
        setIsImporting(false)
      }
    },
    [addToast, navigate],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isImporting) setIsDragging(true)
  }, [isImporting])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (isImporting) return
      const files = Array.from(e.dataTransfer.files)
      void runImport(files)
    },
    [isImporting, runImport],
  )

  const handleFileSelect = useCallback(() => {
    if (isImporting) return
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = ACCEPTED_FORMATS.join(',')
    input.onchange = () => {
      if (input.files) {
        void runImport(Array.from(input.files))
      }
    }
    input.click()
  }, [isImporting, runImport])

  const handleFolderSelect = useCallback(() => {
    if (isImporting) return
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.multiple = true
    input.onchange = () => {
      if (input.files) {
        const files = Array.from(input.files).filter((f) =>
          ACCEPTED_FORMATS.some((ext) => f.name.toLowerCase().endsWith(ext)),
        )
        void runImport(files)
      }
    }
    input.click()
  }, [isImporting, runImport])

  const percent = progress
    ? Math.round(((progress.completed + progress.failed) / progress.total) * 100)
    : 0

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
          isImporting && 'pointer-events-none opacity-60',
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

      {/* Import progress */}
      <AnimatePresence>
        {progress && isImporting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muse-bg-surface rounded-xl border border-muse-glass-border p-4 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muse-accent animate-pulse" />
                <p className="text-sm font-medium">
                  Importing {progress.completed + progress.failed} / {progress.total}
                </p>
              </div>
              <span className="text-sm text-muse-text-muted tabular-nums">{percent}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muse-bg-hover overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            {progress.currentFile && (
              <p className="text-xs text-muse-text-muted mt-2 truncate">
                {progress.currentFile}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import results */}
      <AnimatePresence>
        {progress && !isImporting && (progress.completed > 0 || progress.failed > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {progress.completed > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muse-success/10 border border-muse-success/30">
                <CheckCircle2 className="w-4 h-4 text-muse-success shrink-0" />
                <p className="text-sm text-muse-text">
                  Successfully imported {progress.completed} song{progress.completed === 1 ? '' : 's'}
                </p>
              </div>
            )}
            {progress.errors.length > 0 && (
              <div className="rounded-lg bg-muse-error/10 border border-muse-error/30 overflow-hidden">
                <div className="flex items-center gap-2 p-3">
                  <AlertCircle className="w-4 h-4 text-muse-error shrink-0" />
                  <p className="text-sm text-muse-text">
                    {progress.failed} file(s) failed:
                  </p>
                </div>
                <ul className="max-h-32 overflow-y-auto px-3 pb-3 space-y-1">
                  {progress.errors.slice(0, 10).map((e, i) => (
                    <li key={i} className="text-xs flex items-start gap-1">
                      <X className="w-3 h-3 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-muse-text-muted truncate" title={e.file}>{e.file}</p>
                        <p className="text-muse-error break-words" title={e.error}>
                          {e.error || 'Unknown error'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alternative import options */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={handleFileSelect}
          disabled={isImporting}
          className="gap-2 justify-center"
        >
          <Upload className="w-4 h-4" />
          Select Files
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleFolderSelect}
          disabled={isImporting}
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
