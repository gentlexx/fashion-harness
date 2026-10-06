/**
 * Domain errors for Fashion Project registry operations.
 * Controllers map these onto RemoteError codes; consumers must not treat them as soft misses.
 * @module @gentlexx/dsh-fashion-project/src/errors
 */

import type { ProjectId } from './types.ts'

/** Title failed Host validation after trim (empty or longer than 120). */
export class FashionProjectInvalidTitleError extends Error {
  /**
   * @param title - Rejected title after trim (may be empty).
   */
  constructor(readonly title: string) {
    super(`invalid fashion project title (length ${title.length})`)
    this.name = 'FashionProjectInvalidTitleError'
  }
}

/**
 * Reserved R0 key exists with drifted public-rebuild invariants.
 * Startup must fail; silent overwrite is forbidden.
 */
export class FashionProjectSeedConflictError extends Error {
  /**
   * @param projectId - Conflicting reserved Project id.
   */
  constructor(readonly projectId: ProjectId) {
    super(`fashion project seed conflict for '${projectId}'`)
    this.name = 'FashionProjectSeedConflictError'
  }
}

/** A newly minted ProjectId already occupied a table key after one regeneration. */
export class FashionProjectIdCollisionError extends Error {
  /**
   * @param projectId - Conflicting Project id.
   */
  constructor(readonly projectId: ProjectId) {
    super(`fashion project id collision for '${projectId}'`)
    this.name = 'FashionProjectIdCollisionError'
  }
}
