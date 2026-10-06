/**
 * Client-local Analysis list ordering (browser-safe; no Host package value import).
 * @module @gentlexx/dsh-api-fashion-analysis-controller/src/client/order
 */

/** Objects that carry Client list-order keys. */
export interface AnalysisListOrderable {
  readonly id: string
  readonly updatedAt: string
}

/**
 * Stable list order: `updatedAt` descending, then `id` ascending.
 * @param left - First row.
 * @param right - Second row.
 */
export function compareAnalysisUpdatedDesc(left: AnalysisListOrderable, right: AnalysisListOrderable): number {
  const byUpdated = right.updatedAt.localeCompare(left.updatedAt)
  if (byUpdated !== 0) return byUpdated
  return String(left.id).localeCompare(String(right.id))
}
