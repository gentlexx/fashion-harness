/**
 * Stable Fashion Design list ordering shared by Host and Client.
 * @module @gentlexx/dsh-fashion-design/src/order
 */

/** Objects that carry Host list-order keys. */
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
