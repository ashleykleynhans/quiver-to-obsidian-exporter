import { describe, it, expect } from 'vitest'
import { sanitizeTitle } from '../../src/transform/title-sanitizer.mjs'

describe('sanitizeTitle', () => {
  it('replaces forward slashes with fullwidth equivalents', () => {
    expect(sanitizeTitle('path/to/file')).toBe('path／to／file')
  })

  it('replaces colons with fullwidth equivalents', () => {
    expect(sanitizeTitle('key: value')).toBe('key： value')
  })

  it('replaces backslashes with yen sign', () => {
    expect(sanitizeTitle('path\\file')).toBe('path¥file')
  })

  it('replaces hash with fullwidth equivalent', () => {
    expect(sanitizeTitle('heading # title')).toBe('heading ＃ title')
  })

  it('replaces caret with tilde', () => {
    expect(sanitizeTitle('text^note')).toBe('text~note')
  })

  it('replaces square brackets with fullwidth equivalents', () => {
    expect(sanitizeTitle('[tag]')).toBe('［tag］')
  })

  it('replaces pipe with fullwidth equivalent', () => {
    expect(sanitizeTitle('a|b')).toBe('a｜b')
  })

  it('sanitizes dates from YYYY/MM/DD to YYYY-MM-DD', () => {
    expect(sanitizeTitle('2024/03/15 meeting')).toBe('2024-03-15 meeting')
  })

  it('sanitizes times from HH:MM:SS to fullwidth colons', () => {
    expect(sanitizeTitle('meeting 14:30:00')).toBe('meeting 14：30：00')
  })

  it('sanitizes date and time together', () => {
    expect(sanitizeTitle('2024/01/20 09:15:30 notes')).toBe('2024-01-20 09：15：30 notes')
  })

  it('handles multiple dates in one title', () => {
    expect(sanitizeTitle('2024/01/01 to 2024/12/31')).toBe('2024-01-01 to 2024-12-31')
  })

  it('handles multiple special characters together', () => {
    expect(sanitizeTitle('[note] #tag | key: val')).toBe('［note］ ＃tag ｜ key： val')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeTitle('')).toBe('')
  })

  it('returns plain text unchanged', () => {
    expect(sanitizeTitle('simple title')).toBe('simple title')
  })
})
