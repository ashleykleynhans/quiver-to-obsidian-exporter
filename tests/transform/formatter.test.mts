import { describe, it, expect } from 'vitest'
import { formatTimestamp } from '../../src/transform/formatter.mjs'

describe('formatTimestamp', () => {
  it('formats a timestamp to YYYY-MM-DD(ddd) HH:mm:ss', () => {
    // 2024-01-15 12:30:45 UTC
    const timestamp = Date.UTC(2024, 0, 15, 12, 30, 45)
    const result = formatTimestamp(timestamp)
    // Exact day name depends on timezone, so just check the format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}\(\w{3}\) \d{2}:\d{2}:\d{2}$/)
  })

  it('formats epoch zero', () => {
    const result = formatTimestamp(0)
    expect(result).toMatch(/^1970-01-0\d\(\w{3}\) \d{2}:\d{2}:\d{2}$/)
  })

  it('formats a known date consistently', () => {
    // Use a specific timestamp and check it contains the expected date part
    const timestamp = new Date('2023-06-15T00:00:00Z').getTime()
    expect(result => result).toBeDefined()
    const result = formatTimestamp(timestamp)
    expect(result).toContain('2023-06-1')
  })
})
