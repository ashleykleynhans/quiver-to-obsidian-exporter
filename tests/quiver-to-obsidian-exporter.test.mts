import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs-extra'
import fg from 'fast-glob'
import path from 'path'
import { convertNotebook, exportQvlibrary } from '../src/quiver-to-obsidian-exporter.mjs'

vi.mock('fs-extra')
vi.mock('fast-glob')
vi.mock('../src/quiver-to-obsidian-transform.mjs', () => ({
  transformQuiverNoteToObsidian: vi.fn().mockReturnValue({
    title: 'Test Note',
    content: '# Test',
    quiverMeta: { created_at: 1700000000, updated_at: 1700001000 },
  }),
}))
vi.mock('../src/migration-support/file-timestamp-cloner.mjs', () => ({
  cloneTimestamp: vi.fn(),
}))
vi.mock('cli-progress', () => ({
  SingleBar: class {
    start() {}
    increment() {}
    stop() {}
  },
  Presets: { shades_classic: {} },
}))

describe('convertNotebook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips notes with missing meta.json', () => {
    vi.mocked(fg.sync).mockReturnValue(['/notebook/note1.qvnote'] as any)
    vi.mocked(fs.pathExistsSync).mockImplementation((p: any) => {
      if (p.toString().endsWith('meta.json')) return false
      return true
    })

    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    convertNotebook('/notebook', '/output', ['Notes'], { type: 'sameFolderAsEachFile' })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Skipping note with missing files'))
  })

  it('skips notes with missing content.json', () => {
    vi.mocked(fg.sync).mockReturnValue(['/notebook/note1.qvnote'] as any)
    vi.mocked(fs.pathExistsSync).mockImplementation((p: any) => {
      if (p.toString().endsWith('content.json')) return false
      return true
    })

    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    convertNotebook('/notebook', '/output', ['Notes'], { type: 'sameFolderAsEachFile' })
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Skipping note with missing files'))
  })

  it('processes notes when both meta.json and content.json exist', () => {
    vi.mocked(fg.sync).mockReturnValue(['/notebook/note1.qvnote'] as any)
    vi.mocked(fs.pathExistsSync).mockReturnValue(true)

    convertNotebook('/notebook', '/output', ['Notes'], { type: 'sameFolderAsEachFile' })

    expect(fs.ensureDirSync).toHaveBeenCalled()
    expect(fs.writeFileSync).toHaveBeenCalled()
  })

  it('copies resources when resources directory exists', () => {
    vi.mocked(fg.sync).mockImplementation((pattern: any) => {
      if (pattern.includes('*.qvnote')) return ['/notebook/note1.qvnote'] as any
      if (pattern.includes('resources')) return ['/notebook/note1.qvnote/resources/image.png'] as any
      return [] as any
    })
    vi.mocked(fs.pathExistsSync).mockReturnValue(true)

    convertNotebook('/notebook', '/output', ['Notes'], { type: 'sameFolderAsEachFile' })
    expect(fs.copySync).toHaveBeenCalled()
  })

  it('does not copy resources when resources directory does not exist', () => {
    vi.mocked(fg.sync).mockImplementation((pattern: any) => {
      if (pattern.includes('*.qvnote')) return ['/notebook/note1.qvnote'] as any
      // Should not reach here if resources dir doesn't exist
      return [] as any
    })
    vi.mocked(fs.pathExistsSync).mockImplementation((p: any) => {
      const s = p.toString()
      if (s.endsWith('meta.json') || s.endsWith('content.json')) return true
      return false
    })

    convertNotebook('/notebook', '/output', ['Notes'], { type: 'sameFolderAsEachFile' })
    expect(fs.copySync).not.toHaveBeenCalled()
  })

  it('handles write errors gracefully', () => {
    vi.mocked(fg.sync).mockReturnValue(['/notebook/note1.qvnote'] as any)
    vi.mocked(fs.pathExistsSync).mockReturnValue(true)
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error('EACCES')
    })

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    convertNotebook('/notebook', '/output', ['Notes'], { type: 'sameFolderAsEachFile' })
    expect(errorSpy).toHaveBeenCalled()
  })
})

describe('exportQvlibrary', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.mocked(fs.ensureDirSync).mockImplementation(() => undefined)
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined)
    vi.mocked(fs.pathExistsSync).mockReturnValue(true)
    vi.mocked(fs.copySync).mockImplementation(() => undefined)
  })

  it('processes Inbox and Trash notebooks', () => {
    // fg.sync for discovering notebooks
    vi.mocked(fg.sync).mockImplementation((pattern: any) => {
      if (pattern.includes('*.qvnotebook')) {
        return [
          '/lib/Inbox.qvnotebook',
          '/lib/Trash.qvnotebook',
        ] as any
      }
      // No notes inside notebooks
      return [] as any
    })

    // Tree meta with no children
    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      if (filePath.toString().endsWith('meta.json')) {
        return JSON.stringify({ children: [] })
      }
      return '' as any
    })

    exportQvlibrary('/lib', '/output', { type: 'sameFolderAsEachFile' })
    // Should not throw — Inbox and Trash are processed
  })

  it('traverses tree structure and processes child notebooks', () => {
    vi.mocked(fg.sync).mockImplementation((pattern: any) => {
      if (pattern.includes('*.qvnotebook')) {
        return [
          '/lib/Inbox.qvnotebook',
          '/lib/Trash.qvnotebook',
          '/lib/ABC123.qvnotebook',
        ] as any
      }
      return [] as any
    })

    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      const p = filePath.toString()
      if (p === path.join('/lib', 'meta.json')) {
        return JSON.stringify({
          children: [{ uuid: 'ABC123' }],
        })
      }
      if (p === path.join('/lib/ABC123.qvnotebook', 'meta.json')) {
        return JSON.stringify({ name: 'My Notebook' })
      }
      return '' as any
    })

    exportQvlibrary('/lib', '/output', { type: 'sameFolderAsEachFile' })
    // Should process without errors
  })

  it('handles nested folder tree with children', () => {
    vi.mocked(fg.sync).mockImplementation((pattern: any) => {
      if (pattern.includes('*.qvnotebook')) {
        return [
          '/lib/Inbox.qvnotebook',
          '/lib/Trash.qvnotebook',
          '/lib/PARENT.qvnotebook',
          '/lib/CHILD.qvnotebook',
        ] as any
      }
      return [] as any
    })

    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      const p = filePath.toString()
      if (p === path.join('/lib', 'meta.json')) {
        return JSON.stringify({
          children: [{
            uuid: 'PARENT',
            children: [{ uuid: 'CHILD' }],
          }],
        })
      }
      if (p === path.join('/lib/PARENT.qvnotebook', 'meta.json')) {
        return JSON.stringify({ name: 'Parent' })
      }
      if (p === path.join('/lib/CHILD.qvnotebook', 'meta.json')) {
        return JSON.stringify({ name: 'Child' })
      }
      return '' as any
    })

    exportQvlibrary('/lib', '/output', { type: 'sameFolderAsEachFile' })
  })

  it('skips tree nodes with unknown UUIDs', () => {
    vi.mocked(fg.sync).mockImplementation((pattern: any) => {
      if (pattern.includes('*.qvnotebook')) {
        return [
          '/lib/Inbox.qvnotebook',
          '/lib/Trash.qvnotebook',
        ] as any
      }
      return [] as any
    })

    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      if (filePath.toString() === path.join('/lib', 'meta.json')) {
        return JSON.stringify({
          children: [{ uuid: 'NONEXISTENT' }],
        })
      }
      return '' as any
    })

    // Should not throw when UUID doesn't match any notebook
    exportQvlibrary('/lib', '/output', { type: 'sameFolderAsEachFile' })
  })
})
