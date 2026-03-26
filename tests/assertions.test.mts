import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs-extra'
import { assertValidQvlibraryPath } from '../src/assertions.mjs'

vi.mock('fs-extra')

describe('assertValidQvlibraryPath', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('does not exit when path exists and is a directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any)
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)

    assertValidQvlibraryPath('/valid/path.qvlibrary')

    expect(exitSpy).not.toHaveBeenCalled()
  })

  it('exits with code 2 when path does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    assertValidQvlibraryPath('/nonexistent/path')

    expect(exitSpy).toHaveBeenCalledWith(2)
  })

  it('exits with code 2 when path is not a directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as any)
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    assertValidQvlibraryPath('/some/file.txt')

    expect(exitSpy).toHaveBeenCalledWith(2)
  })
})
