/**
 * Fashion Agent Host errors.
 * @module @gentlexx/dsh-fashion-agent/src/errors
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'

/** Snapshot could not be assembled from current Fashion registries. */
export class FashionAgentSnapshotError extends Error {
  override readonly name = 'FashionAgentSnapshotError'

  /**
   * @param reason - machine-stable failure class.
   * @param message - operator-facing description without guessed identity.
   * @param projectId - project that failed, when known.
   */
  constructor(
    readonly reason: 'not-found' | 'inaccessible' | 'snapshot-failed' | 'broken-reference',
    message: string,
    readonly projectId: ProjectId | null,
  ) {
    super(message)
  }
}
