import { describe, it, expect } from 'vitest'
import { transformImageLinkOnMarkdown } from '../../src/transform/image-link-transform.mjs'

describe('transformImageLinkOnMarkdown', () => {
  it('converts quiver-image-url links to Obsidian embed syntax', () => {
    const input = '![alt](quiver-image-url/photo.png)'
    expect(transformImageLinkOnMarkdown(input)).toBe('![[photo.png]]')
  })

  it('converts quiver-image-url with dimensions', () => {
    const input = '![alt](quiver-image-url/photo.png =400x300)'
    expect(transformImageLinkOnMarkdown(input)).toBe('![[photo.png|400x300]]')
  })

  it('leaves non-quiver links unchanged', () => {
    const input = '![alt](https://example.com/photo.png)'
    expect(transformImageLinkOnMarkdown(input)).toBe('![alt](https://example.com/photo.png)')
  })

  it('leaves regular markdown links unchanged', () => {
    const input = '[click here](https://example.com)'
    expect(transformImageLinkOnMarkdown(input)).toBe('[click here](https://example.com)')
  })

  it('handles multiple quiver-image-url links in one string', () => {
    const input = '![a](quiver-image-url/one.png) text ![b](quiver-image-url/two.jpg)'
    expect(transformImageLinkOnMarkdown(input)).toBe('![[one.png]] text ![[two.jpg]]')
  })

  it('handles text with no links', () => {
    const input = 'just plain text'
    expect(transformImageLinkOnMarkdown(input)).toBe('just plain text')
  })

  it('handles empty string', () => {
    expect(transformImageLinkOnMarkdown('')).toBe('')
  })

  it('preserves markdown bold and heading markers', () => {
    const input = '**bold** and # heading'
    expect(transformImageLinkOnMarkdown(input)).toBe('**bold** and # heading')
  })
})
