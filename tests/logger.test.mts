import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('logger (non-verbose)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('error logs to console.error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().error('test error')
    expect(spy).toHaveBeenCalledWith('test error')
  })

  it('forceInfo always logs to console.info', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().forceInfo('forced message')
    expect(spy).toHaveBeenCalledWith('forced message')
  })

  it('completed logs success message', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().completed()
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('completed successfully'))
  })

  it('info does not log when not verbose', async () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().info('should not appear')
    const calls = spy.mock.calls.filter(c => c[0] === 'should not appear')
    expect(calls).toHaveLength(0)
  })

  it('debug does not log when not verbose', async () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().debug('debug message')
    const calls = spy.mock.calls.filter(c => c[0] === 'debug message')
    expect(calls).toHaveLength(0)
  })

  it('debugNotebookPathsByUUID does not log when not verbose', async () => {
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().debugNotebookPathsByUUID(new Map([['key', 'value']]))
    const calls = spy.mock.calls.filter(c => c[0]?.includes?.('notebookPathsByUUID'))
    expect(calls).toHaveLength(0)
  })
})

describe('logger (verbose)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('info logs when verbose', async () => {
    vi.stubEnv('QUIVER_TO_OBSIDIAN_EXPORTER_LOGGING_VERBOSE', 'true')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().info('verbose info')
    expect(spy).toHaveBeenCalledWith('verbose info')
  })

  it('debug logs when verbose', async () => {
    vi.stubEnv('QUIVER_TO_OBSIDIAN_EXPORTER_LOGGING_VERBOSE', 'true')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    getLogger().debug('verbose debug')
    expect(spy).toHaveBeenCalledWith('verbose debug')
  })

  it('debugNotebookPathsByUUID logs entries when verbose', async () => {
    vi.stubEnv('QUIVER_TO_OBSIDIAN_EXPORTER_LOGGING_VERBOSE', 'true')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    const spy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const { getLogger } = await import('../src/logger.mjs')
    const map = new Map([['uuid1', '/path/one'], ['uuid2', '/path/two']])
    getLogger().debugNotebookPathsByUUID(map)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('notebookPathsByUUID'))
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('uuid1'))
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('uuid2'))
  })

  it('logs LogConfig on creation when verbose', async () => {
    vi.stubEnv('QUIVER_TO_OBSIDIAN_EXPORTER_LOGGING_VERBOSE', 'true')
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    await import('../src/logger.mjs')
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('LogConfig'))
  })
})
