import { describe, it, expect } from 'vitest'
import '../../src/extensions/String+Path.mjs'

describe('String.prototype.lastPathComponent', () => {
  it('returns the last component of a path', () => {
    expect('/Users/ashley/notes'.lastPathComponent()).toBe('notes')
  })

  it('returns the filename from a file path', () => {
    expect('/path/to/file.txt'.lastPathComponent()).toBe('file.txt')
  })

  it('returns the full string when there are no slashes', () => {
    expect('filename'.lastPathComponent()).toBe('filename')
  })

  it('returns empty string for path ending with slash', () => {
    expect('/path/to/dir/'.lastPathComponent()).toBe('')
  })

  it('handles single slash', () => {
    expect('/'.lastPathComponent()).toBe('')
  })

  it('handles empty string', () => {
    expect(''.lastPathComponent()).toBe('')
  })
})
