import { describe, it, expect, vi, beforeEach } from 'vitest'
import { utimes } from 'utimes'
import { cloneTimestamp } from '../../src/migration-support/file-timestamp-cloner.mjs'

vi.mock('utimes')

describe('cloneTimestamp', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls utimes with correct timestamps from quiver meta', () => {
    vi.mocked(utimes).mockImplementation((_path, _times, cb) => {
      cb(null)
    })

    const meta = { created_at: 1700000000, updated_at: 1700001000 }
    cloneTimestamp('/path/to/file.md', meta)

    expect(utimes).toHaveBeenCalledWith(
      '/path/to/file.md',
      {
        btime: 1700000000000,
        mtime: 1700001000000,
        atime: 1700001000000,
      },
      expect.any(Function)
    )
  })

  it('logs error when utimes callback reports an error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(utimes).mockImplementation((_path, _times, cb) => {
      cb(new Error('permission denied'))
    })

    const meta = { created_at: 1700000000, updated_at: 1700001000 }
    cloneTimestamp('/path/to/file.md', meta)

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error occurred while updating the file timestamp'))
  })

  it('catches and logs errors thrown by utimes', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(utimes).mockImplementation(() => {
      throw new Error('utimes crashed')
    })

    const meta = { created_at: 1700000000, updated_at: 1700001000 }
    cloneTimestamp('/path/to/file.md', meta)

    expect(errorSpy).toHaveBeenCalled()
  })
})
