import { describe, it, expect } from 'vitest'
import TurndownService from '../../src/transform/turndown-service.mjs'

describe('TurndownService', () => {
  describe('quiver-file-url rule', () => {
    it('converts quiver-file-url anchor links to Obsidian wiki links', () => {
      const html = '<a href="quiver-file-url/document.pdf">My Document</a>'
      const result = TurndownService.turndown(html)
      expect(result).toBe('[[document.pdf]]')
    })

    it('leaves non-quiver anchor links as standard markdown', () => {
      const html = '<a href="https://example.com">Example</a>'
      const result = TurndownService.turndown(html)
      expect(result).toBe('[Example](https://example.com)')
    })
  })

  describe('quiver-file-url-image rule', () => {
    it('converts quiver-image-url img tags to Obsidian embed syntax', () => {
      const html = '<img src="quiver-image-url/photo.png">'
      const result = TurndownService.turndown(html)
      expect(result).toBe('![[photo.png]]')
    })

    it('leaves non-quiver img tags as standard markdown', () => {
      const html = '<img src="https://example.com/photo.png" alt="photo">'
      const result = TurndownService.turndown(html)
      expect(result).toBe('![photo](https://example.com/photo.png)')
    })
  })

  describe('general HTML conversion', () => {
    it('converts bold HTML to markdown', () => {
      expect(TurndownService.turndown('<strong>bold</strong>')).toBe('**bold**')
    })

    it('converts italic HTML to markdown', () => {
      expect(TurndownService.turndown('<em>italic</em>')).toBe('_italic_')
    })

    it('converts headings', () => {
      expect(TurndownService.turndown('<h1>Title</h1>')).toBe('Title\n=====')
    })
  })
})
