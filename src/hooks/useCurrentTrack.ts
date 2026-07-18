import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/library/db'
import { usePlayerStore } from '@/player/PlayerStore'

/**
 * Resolve the currently-playing track from the store's currentTrackId.
 * Re-renders automatically if the track record changes (e.g. favorite toggle).
 */
export function useCurrentTrack() {
  const currentTrackId = usePlayerStore((s) => s.currentTrackId)
  const track = useLiveQuery(
    async () => (currentTrackId ? db.tracks.get(currentTrackId) : undefined),
    [currentTrackId],
  )
  return track
}
