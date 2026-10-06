/** Research form helper unit tests. */
import { describe, expect, it } from 'vitest'
import {
  isValidHttpUrl,
  parseLimitationLines,
} from '../src/client/research/ResearchFormState.ts'

describe('ResearchFormState', () => {
  it('admits http(s) URLs without credentials and rejects others', () => {
    expect(isValidHttpUrl('https://example.com/path')).toBe(true)
    expect(isValidHttpUrl('http://example.com')).toBe(true)
    expect(isValidHttpUrl('ftp://example.com')).toBe(false)
    expect(isValidHttpUrl('https://user:pass@example.com')).toBe(false)
    expect(isValidHttpUrl('not a url')).toBe(false)
  })

  it('splits limitation lines and drops blanks', () => {
    expect(parseLimitationLines('a\n\n b \n')).toEqual(['a', 'b'])
  })
})
