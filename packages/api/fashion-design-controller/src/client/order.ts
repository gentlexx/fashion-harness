/**
 * Stable Fashion Design list ordering copied for INLINE_SAFE Client use.
 * @module @gentlexx/dsh-api-fashion-design-controller/src/client/order
 */

/** Objects that carry Client list-order keys. */
export interface DesignListOrderable {
  readonly id: string
  readonly updatedAt: string
}

/**
 * Stable list order: `updatedAt` descending, then `id` ascending.
 * @param left - First row.
 * @param right - Second row.
 */
export function compareDesignUpdatedDesc(left: DesignListOrderable, right: DesignListOrderable): number {
  const byUpdated = right.updatedAt.localeCompare(left.updatedAt)
  if (byUpdated !== 0) return byUpdated
  return String(left.id).localeCompare(String(right.id))
}
