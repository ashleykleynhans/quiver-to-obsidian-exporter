import { describe, it, expect } from 'vitest'
import { parseBoolean } from '../../src/util/environment-variable-parser.mjs'

describe('parseBoolean', () => {
  it('returns true for "true"', () => {
    expect(parseBoolean('true')).toBe(true)
  })

  it('returns true for "TRUE" (case insensitive)', () => {
    expect(parseBoolean('TRUE')).toBe(true)
  })

  it('returns true for "True"', () => {
    expect(parseBoolean('True')).toBe(true)
  })

  it('returns true for "yes"', () => {
    expect(parseBoolean('yes')).toBe(true)
  })

  it('returns true for "YES"', () => {
    expect(parseBoolean('YES')).toBe(true)
  })

  it('returns true for "1"', () => {
    expect(parseBoolean('1')).toBe(true)
  })

  it('returns true for positive integers like "42"', () => {
    expect(parseBoolean('42')).toBe(true)
  })

  it('returns false for "0"', () => {
    expect(parseBoolean('0')).toBe(false)
  })

  it('returns false for "false"', () => {
    expect(parseBoolean('false')).toBe(false)
  })

  it('returns false for "no"', () => {
    expect(parseBoolean('no')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(parseBoolean('')).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(parseBoolean(undefined)).toBe(false)
  })

  it('returns false for random string', () => {
    expect(parseBoolean('banana')).toBe(false)
  })

  it('returns false for negative numbers', () => {
    expect(parseBoolean('-1')).toBe(false)
  })

  it('returns false for "00"', () => {
    expect(parseBoolean('00')).toBe(false)
  })
})
