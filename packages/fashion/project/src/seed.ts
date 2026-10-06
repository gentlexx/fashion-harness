/**
 * R0 public-rebuild seed constants for the Fashion Project registry.
 * @module @gentlexx/dsh-fashion-project/src/seed
 */

import type { ProjectId } from './types.ts'
import type { ProjectRecordV0 } from './schema/v0.ts'

/** Reserved R0 Project id; keeps F1-01 overview URLs stable. */
export const R0_PROJECT_ID = 'r0-us-womens-khaki-utility-jacket' as ProjectId

/** Fixed R0 seed timestamp (public case date), not wall clock at boot. */
export const R0_SEED_CREATED_AT = '2026-09-21T00:00:00.000Z'

/** Canonical R0 seed body written by {@link ensureR0Seed}. */
export const R0_SEED_RECORD: ProjectRecordV0 = {
  title: '美国女装卡其 Utility Jacket',
  origin: 'public-rebuild',
  accessMode: 'read-only',
  createdAt: R0_SEED_CREATED_AT,
  updatedAt: R0_SEED_CREATED_AT,
  revision: 0,
}

/**
 * Whether a stored R0 row satisfies public-rebuild invariants.
 * @param record - candidate row under {@link R0_PROJECT_ID}.
 */
export function isValidR0Seed(record: ProjectRecordV0): boolean {
  return record.origin === 'public-rebuild'
    && record.accessMode === 'read-only'
    && record.title.length > 0
}
