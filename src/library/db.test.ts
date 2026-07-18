import { describe, expect, it } from 'vitest'
import { db } from './db'

describe('MuseDB tracks schema', () => {
  it('indexes blobId for import duplicate detection', () => {
    expect(db.tracks.schema.idxByName.blobId).toBeDefined()
  })
})
