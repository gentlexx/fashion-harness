/**
 * Client-side project list filter (F1-03 §6.2). Does not call Remote or reorder Host results.
 * @module @gentlexx/dsh-client-ui-fashion-shell/src/client/presentation/filter-projects
 */

import type { ProjectOrigin, ProjectView } from '@gentlexx/dsh-fashion-project/types'

/** Origin filter chip values. */
export type OriginFilter = 'all' | 'user' | 'public-rebuild'

/**
 * Filter projects by title query and origin chip.
 * Title match is locale-aware case-insensitive (`String.prototype.localeCompare` fold via `toLocaleLowerCase`).
 * @param items - Host-stable ordered snapshot rows.
 * @param query - Raw search box text.
 * @param originFilter - Active origin chip.
 * @param locale - Active UI locale for case folding.
 */
export function filterProjects(
  items: readonly ProjectView[],
  query: string,
  originFilter: OriginFilter,
  locale: string,
): readonly ProjectView[] {
  const needle = query.trim().toLocaleLowerCase(locale)
  return items.filter((item) => {
    if (originFilter === 'user' && item.origin !== 'user') return false
    if (originFilter === 'public-rebuild' && item.origin !== 'public-rebuild') return false
    if (needle.length === 0) return true
    return item.title.toLocaleLowerCase(locale).includes(needle)
  })
}

/**
 * Whether the filter chip / query combination is active (for filter-empty vs empty).
 * @param query - Raw search box text.
 * @param originFilter - Active origin chip.
 */
export function isFilterActive(query: string, originFilter: OriginFilter): boolean {
  return query.trim().length > 0 || originFilter !== 'all'
}

/** Type guard helper for origin chips. */
export function isOriginFilter(value: string): value is OriginFilter {
  return value === 'all' || value === 'user' || value === 'public-rebuild'
}

/** Re-export origin union for filter wiring clarity. */
export type { ProjectOrigin }
