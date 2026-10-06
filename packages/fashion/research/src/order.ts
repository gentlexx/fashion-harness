/**
 * Stable Fashion Research list ordering shared by Host and Client.
 * @module @gentlexx/dsh-fashion-research/src/order
 */

/** Objects that carry Host list-order keys. */
export interface ResearchListOrderable {
  readonly id: string
  readonly updatedAt: string
}

/**
 * Stable list order: `updatedAt` descending, then `id` ascending.
 * @param left - First row.
 * @param right - Second row.
 */
export function compareResearchUpdatedDesc(left: ResearchListOrderable, right: ResearchListOrderable): number {
  const byUpdated = right.updatedAt.localeCompare(left.updatedAt)
  if (byUpdated !== 0) return byUpdated
  return String(left.id).localeCompare(String(right.id))
}
