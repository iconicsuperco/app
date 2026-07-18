import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/library/db'
import type { Track } from '@/types'

/** Resolve queue IDs to tracks while preserving queue order and duplicate entries. */
export function useQueueTracks(queue: string[]): (Track | undefined)[] {
  return useLiveQuery(() => db.tracks.bulkGet(queue), [queue]) ?? []
}
