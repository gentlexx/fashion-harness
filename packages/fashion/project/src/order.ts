/**
 * Stable Fashion Project list ordering shared by Host and Client.
 * @module @gentlexx/dsh-fashion-project/src/order
 */

import type { FashionProject } from './types.ts'

/**
 * Stable list order: `createdAt` descending, then `id` ascending.
 * @param left - First project.
 * @param right - Second project.
 */
export function compareFashionProjects(left: FashionProject, right: FashionProject): number {
  const byCreated = right.createdAt.localeCompare(left.createdAt)
  if (byCreated !== 0) return byCreated
  return String(left.id).localeCompare(String(right.id))
}
