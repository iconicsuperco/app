import { describe, expect, it } from 'vitest'
import { parseLRC } from './parseLRC'
describe('parseLRC', () =>
  it('parses LRC timestamps', () =>
    expect(parseLRC('[00:01.50]Hello')).toEqual([{ time: 1.5, text: 'Hello' }])))
