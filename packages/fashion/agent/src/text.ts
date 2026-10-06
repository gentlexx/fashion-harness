/**
 * Present optional Fashion text without masking absence as `''`.
 * @module @gentlexx/dsh-fashion-agent/src/text
 */

/**
 * Return trimmed text or `null` when the value is missing or blank.
 * @param value - raw domain string.
 */
export function presentText(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

/**
 * Return trimmed text that a snapshot already requires, or throw when blank.
 * @param value - required domain string.
 * @param label - field name for the failure.
 */
export function requireText(value: string, label: string): string {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    throw new Error(`fashion-agent: ${label} is missing`)
  }
  return trimmed
}
