/**
 * Host URL admission for Fashion Research Source locators.
 * @module @gentlexx/dsh-fashion-research/src/url
 */

import { FashionResearchInvalidUrlError } from './errors.ts'

/** Normalized URL pair retained on a Source row. */
export interface NormalizedSourceUrl {
  readonly original: string
  readonly normalized: string
}

/**
 * Admit an http(s) URL without credentials and return original plus normalized forms.
 * Legal URL ≠ content available or licensed; F2-01 minimal only registers.
 * @param raw - Caller-supplied URL string.
 * @returns original input and a host-lowercased normalized href.
 * @throws FashionResearchInvalidUrlError for non-http(s), credentials, or parse failure.
 */
export function normalizeSourceUrl(raw: string): NormalizedSourceUrl {
  const trimmed = raw.trim()
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new FashionResearchInvalidUrlError(trimmed)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new FashionResearchInvalidUrlError(trimmed)
  }
  if (parsed.username !== '' || parsed.password !== '') {
    throw new FashionResearchInvalidUrlError(trimmed)
  }
  const hostname = parsed.hostname.toLowerCase()
  const auth = ''
  const port = parsed.port !== '' ? `:${parsed.port}` : ''
  const normalized = `${parsed.protocol}//${auth}${hostname}${port}${parsed.pathname}${parsed.search}${parsed.hash}`
  return { original: trimmed, normalized }
}
