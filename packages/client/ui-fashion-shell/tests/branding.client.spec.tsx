// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { FashionBrandMark } from '../src/client/FashionBrandMark.tsx'
import { applyFashionDocumentBrand } from '../src/client/document-brand.ts'

afterEach(() => { cleanup() })

describe('Fashion-only browser identity', () => {
  it('applies and restores title, favicon, and manifest', () => {
    document.head.innerHTML = '<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/favicon.svg"><title>DSH Local Build</title>'
    const restore = applyFashionDocumentBrand(document)
    expect(document.title).toBe('Fashion Harness')
    expect(document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.getAttribute('href')).toBe('/fashion-favicon.svg')
    expect(document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.getAttribute('href')).toBe('/fashion-manifest.webmanifest')
    restore()
    expect(document.title).toBe('DSH Local Build')
    expect(document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.getAttribute('href')).toBe('/favicon.svg')
    expect(document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.getAttribute('href')).toBe('/manifest.webmanifest')
  })

  it('renders the neutral FH hero mark at the host-requested size', () => {
    const view = render(<FashionBrandMark size={34} className="hero-mark" />)
    expect(view.container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(view.container.querySelector('svg')?.getAttribute('focusable')).toBe('false')
    expect(view.container.querySelector('svg')?.getAttribute('width')).toBe('34')
    expect(view.container.querySelector('svg')?.classList.contains('hero-mark')).toBe(true)
  })
})
