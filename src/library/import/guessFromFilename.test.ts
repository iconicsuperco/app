import { describe, it, expect } from 'vitest'
import { guessFromFilename } from './guessFromFilename'

describe('guessFromFilename', () => {
  it('parses "Artist - Title.ext"', () => {
    expect(guessFromFilename('Daft Punk - Get Lucky.mp3')).toEqual({
      artist: 'Daft Punk',
      title: 'Get Lucky',
    })
  })

  it('parses "01. Artist - Title.ext"', () => {
    expect(guessFromFilename('03. Pink Floyd - Time.flac')).toEqual({
      trackNo: 3,
      artist: 'Pink Floyd',
      title: 'Time',
    })
  })

  it('parses "01. Title" (track number + title only)', () => {
    expect(guessFromFilename('07. Wonderwall.mp3')).toEqual({
      trackNo: 7,
      title: 'Wonderwall',
    })
  })

  it('parses "01 - Title" (dash separator, no artist)', () => {
    expect(guessFromFilename('01 - Intro.mp3')).toEqual({
      trackNo: 1,
      title: 'Intro',
    })
  })

  it('parses bare "Title" with no track number', () => {
    expect(guessFromFilename('Bohemian Rhapsody.mp3')).toEqual({
      title: 'Bohemian Rhapsody',
    })
  })

  it('parses "01 - Artist - Title" (three segments)', () => {
    expect(guessFromFilename('05 - Radiohead - Karma Police.mp3')).toEqual({
      trackNo: 5,
      artist: 'Radiohead',
      title: 'Karma Police',
    })
  })

  it('replaces underscores with spaces', () => {
    expect(guessFromFilename('The_Beatles - Hey_Jude.mp3')).toEqual({
      artist: 'The Beatles',
      title: 'Hey Jude',
    })
  })

  it('handles parentheses track separators', () => {
    expect(guessFromFilename('12) Artist - Title.mp3')).toEqual({
      trackNo: 12,
      artist: 'Artist',
      title: 'Title',
    })
  })

  it('handles files with no extension', () => {
    expect(guessFromFilename('Just A Title')).toEqual({
      title: 'Just A Title',
    })
  })

  it('handles empty filename gracefully', () => {
    expect(guessFromFilename('')).toEqual({})
  })

  it('strips a variety of extensions', () => {
    expect(guessFromFilename('Song.m4a')?.title).toBe('Song')
    expect(guessFromFilename('Song.flac')?.title).toBe('Song')
    expect(guessFromFilename('Song.opus')?.title).toBe('Song')
  })

  it('title-cases the output', () => {
    const result = guessFromFilename('led zeppelin - stairway to heaven.mp3')
    expect(result).toEqual({
      artist: 'Led Zeppelin',
      title: 'Stairway To Heaven',
    })
  })

  it('handles multi-digit track numbers', () => {
    expect(guessFromFilename('99. Song.flac')?.trackNo).toBe(99)
  })
})
