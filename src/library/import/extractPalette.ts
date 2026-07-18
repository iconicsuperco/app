import type { ColorPalette } from '@/types'

/**
 * Extract a 4-color palette (vibrant / muted / dark / light) from an image Blob.
 * Uses a downscaled canvas + simple bucketed histogram — no external dependency.
 *
 * Returns null if the blob can't be decoded as an image.
 */
export async function extractPalette(blob: Blob): Promise<ColorPalette | null> {
  try {
    const bitmap = await createImageBitmap(blob, { resizeWidth: 64, resizeHeight: 64 })
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    ctx.drawImage(bitmap, 0, 0)
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    bitmap.close()

    // Bucket pixels by quantized color, scoring by saturation × population
    const buckets = new Map<string, { r: number; g: number; b: number; count: number; sat: number; lum: number }>()

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!
      const g = data[i + 1]!
      const b = data[i + 2]!
      const a = data[i + 3]!
      if (a < 128) continue // skip transparent

      // Quantize to 5 bits per channel to group similar colors
      const qr = r & 0xf0
      const qg = g & 0xf0
      const qb = b & 0xf0
      const key = `${qr},${qg},${qb}`

      const { max, min } = { max: Math.max(r, g, b), min: Math.min(r, g, b) }
      const lum = (max + min) / 2
      const sat = max === 0 ? 0 : (max - min) / max

      const existing = buckets.get(key)
      if (existing) {
        existing.count++
      } else {
        buckets.set(key, { r: qr, g: qg, b: qb, count: 1, sat, lum })
      }
    }

    if (buckets.size === 0) return null

    const candidates = [...buckets.values()]
    const toRgb = (c: { r: number; g: number; b: number }) =>
      `rgb(${c.r}, ${c.g}, ${c.b})`

    // Vibrant: high saturation × population, mid lightness
    const vibrant = pickBest(candidates, {
      preferSaturation: true,
      preferMid: true,
      weightPopulation: 1,
    })

    // Muted: lower saturation, mid lightness
    const muted = pickBest(candidates, {
      preferSaturation: false,
      preferMid: true,
      weightPopulation: 2,
    })

    // Dark: low lightness, any saturation
    const dark = pickBest(candidates, {
      preferSaturation: false,
      preferDark: true,
      weightPopulation: 1,
    })

    // Light: high lightness
    const light = pickBest(candidates, {
      preferSaturation: false,
      preferLight: true,
      weightPopulation: 1,
    })

    return {
      vibrant: vibrant ? toRgb(vibrant) : '#8b5cf6',
      muted: muted ? toRgb(muted) : '#6366f1',
      dark: dark ? toRgb(dark) : '#0a0a0f',
      light: light ? toRgb(light) : '#f0f0f5',
    }
  } catch (err) {
    console.warn('palette extraction failed', err)
    return null
  }
}

interface PickOptions {
  preferSaturation?: boolean
  preferDark?: boolean
  preferLight?: boolean
  preferMid?: boolean
  weightPopulation?: number
}

/** Pick the highest-scoring color bucket per the given preference weights. */
function pickBest(
  candidates: { r: number; g: number; b: number; count: number; sat: number; lum: number }[],
  opts: PickOptions,
) {
  const maxCount = Math.max(...candidates.map((c) => c.count))
  let best: typeof candidates[number] | null = null
  let bestScore = -Infinity

  for (const c of candidates) {
    let score = 0
    const popNorm = c.count / maxCount

    if (opts.preferSaturation) score += c.sat * 3
    else score += (1 - c.sat) * 0.5

    if (opts.preferDark) score += (1 - c.lum / 255) * 2
    if (opts.preferLight) score += (c.lum / 255) * 2
    if (opts.preferMid) score += 1 - Math.abs(c.lum / 255 - 0.5) * 2

    score += popNorm * (opts.weightPopulation ?? 1)

    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }

  return best
}
