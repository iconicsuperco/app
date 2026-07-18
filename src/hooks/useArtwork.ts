import { useEffect, useState } from 'react'
import { db } from '@/library/db'

/**
 * Resolve an artworkId to an object URL for display.
 * Re-fetches when the id changes and revokes the previous URL on cleanup
 * to avoid leaking blob URLs.
 */
export function useArtwork(artworkId?: string): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let revoked = false
    let createdUrl: string | null = null

    async function load() {
      if (!artworkId) {
        setUrl(null)
        return
      }
      const record = await db.artworkBlobs.get(artworkId)
      if (revoked) return
      if (record) {
        createdUrl = URL.createObjectURL(record.blob)
        setUrl(createdUrl)
      } else {
        setUrl(null)
      }
    }

    load()
    return () => {
      revoked = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [artworkId])

  return url
}
