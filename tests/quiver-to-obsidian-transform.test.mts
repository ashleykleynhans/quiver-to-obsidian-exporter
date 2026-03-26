import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs-extra'
import { transformQuiverNoteToObsidian } from '../src/quiver-to-obsidian-transform.mjs'

vi.mock('fs-extra')

describe('transformQuiverNoteToObsidian', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const baseMeta = {
    title: 'Test Note',
    tags: ['tag1', 'tag2'],
    created_at: 1700000000,
    updated_at: 1700001000,
  }

  function setupMocks(meta: any, content: any) {
    vi.mocked(fs.readFileSync).mockImplementation((filePath: any) => {
      if (filePath.toString().endsWith('meta.json')) return JSON.stringify(meta)
      if (filePath.toString().endsWith('content.json')) return JSON.stringify(content)
      throw new Error(`Unexpected file: ${filePath}`)
    })
  }

  it('transforms a text cell using turndown', () => {
    setupMocks(baseMeta, { cells: [{ type: 'text', data: '<p>Hello world</p>' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('Hello world')
  })

  it('transforms a code cell with language fence', () => {
    setupMocks(baseMeta, { cells: [{ type: 'code', language: 'python', data: 'print("hi")' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('```python\nprint("hi")\n```')
  })

  it('transforms a markdown cell', () => {
    setupMocks(baseMeta, { cells: [{ type: 'markdown', data: 'plain markdown' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('plain markdown')
  })

  it('transforms a diagram cell', () => {
    setupMocks(baseMeta, { cells: [{ type: 'diagram', diagramType: 'mermaid', data: 'graph TD' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('```mermaid\ngraph TD\n```')
  })

  it('transforms a latex cell', () => {
    setupMocks(baseMeta, { cells: [{ type: 'latex', data: 'E=mc^2' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('E=mc^2')
  })

  it('throws on unknown cell type', () => {
    setupMocks(baseMeta, { cells: [{ type: 'unknown', data: 'data' }] })
    expect(() => transformQuiverNoteToObsidian('/notes/test.qvnote')).toThrow('Unknown cell type: unknown')
  })

  it('returns sanitized title', () => {
    const meta = { ...baseMeta, title: 'Note [draft] #1' }
    setupMocks(meta, { cells: [{ type: 'markdown', data: 'content' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.title).toBe('Note ［draft］ ＃1')
  })

  it('returns quiverMeta in result', () => {
    setupMocks(baseMeta, { cells: [{ type: 'markdown', data: 'content' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.quiverMeta).toEqual(baseMeta)
  })

  it('generates YAML front matter with tags', () => {
    setupMocks(baseMeta, { cells: [{ type: 'markdown', data: 'text' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('tags:')
    expect(result.content).toContain('  - tag1')
    expect(result.content).toContain('  - tag2')
    expect(result.content).toContain('origin: Quiver')
  })

  it('generates YAML front matter with empty tags', () => {
    const meta = { ...baseMeta, tags: [] }
    setupMocks(meta, { cells: [{ type: 'markdown', data: 'text' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('tags:')
    expect(result.content).toContain('origin: Quiver')
  })

  it('generates front matter with created-at and updated-at timestamps', () => {
    setupMocks(baseMeta, { cells: [{ type: 'markdown', data: 'text' }] })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('created-at:')
    expect(result.content).toContain('updated-at:')
  })

  it('joins multiple cells with double newlines', () => {
    setupMocks(baseMeta, {
      cells: [
        { type: 'markdown', data: 'first' },
        { type: 'markdown', data: 'second' },
      ],
    })
    const result = transformQuiverNoteToObsidian('/notes/test.qvnote')
    expect(result.content).toContain('first\n\nsecond')
  })
})
