/**
 * Domain errors for Fashion Research registry operations.
 * Controllers map these onto RemoteError codes; consumers must not treat them as soft misses.
 * @module @gentlexx/dsh-fashion-research/src/errors
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  EvidenceId,
  ResearchTaskId,
  SampleId,
  SourceId,
} from './types.ts'

/** Requested Project id is absent from the Fashion Project registry. */
export class FashionResearchProjectNotFoundError extends Error {
  /** @param projectId - Missing project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion research project not found: '${projectId}'`)
    this.name = 'FashionResearchProjectNotFoundError'
  }
}

/** Requested ResearchTask id is absent. */
export class FashionResearchTaskNotFoundError extends Error {
  /** @param taskId - Missing task identity. */
  constructor(readonly taskId: ResearchTaskId) {
    super(`fashion research task not found: '${taskId}'`)
    this.name = 'FashionResearchTaskNotFoundError'
  }
}

/** Requested Source id is absent. */
export class FashionResearchSourceNotFoundError extends Error {
  /** @param sourceId - Missing source identity. */
  constructor(readonly sourceId: SourceId) {
    super(`fashion research source not found: '${sourceId}'`)
    this.name = 'FashionResearchSourceNotFoundError'
  }
}

/** Requested Sample id is absent. */
export class FashionResearchSampleNotFoundError extends Error {
  /** @param sampleId - Missing sample identity. */
  constructor(readonly sampleId: SampleId) {
    super(`fashion research sample not found: '${sampleId}'`)
    this.name = 'FashionResearchSampleNotFoundError'
  }
}

/** Requested Evidence id is absent. */
export class FashionResearchEvidenceNotFoundError extends Error {
  /** @param evidenceId - Missing evidence identity. */
  constructor(readonly evidenceId: EvidenceId) {
    super(`fashion research evidence not found: '${evidenceId}'`)
    this.name = 'FashionResearchEvidenceNotFoundError'
  }
}

/** Write refused because the owning Project or object is read-only. */
export class FashionResearchProjectReadOnlyError extends Error {
  /** @param projectId - Read-only project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion research project is read-only: '${projectId}'`)
    this.name = 'FashionResearchProjectReadOnlyError'
  }
}

/** Parent-chain ids belong to different projects. */
export class FashionResearchCrossProjectReferenceError extends Error {
  /**
   * @param projectId - Expected project.
   * @param otherProjectId - Observed foreign project.
   */
  constructor(
    readonly projectId: ProjectId,
    readonly otherProjectId: ProjectId,
  ) {
    super(`fashion research cross-project reference: expected '${projectId}', got '${otherProjectId}'`)
    this.name = 'FashionResearchCrossProjectReferenceError'
  }
}

/** Parent-chain ids belong to different tasks. */
export class FashionResearchCrossTaskReferenceError extends Error {
  /**
   * @param taskId - Expected task.
   * @param otherTaskId - Observed foreign task.
   */
  constructor(
    readonly taskId: ResearchTaskId,
    readonly otherTaskId: ResearchTaskId,
  ) {
    super(`fashion research cross-task reference: expected '${taskId}', got '${otherTaskId}'`)
    this.name = 'FashionResearchCrossTaskReferenceError'
  }
}

/** URL failed Host http(s) safety checks. */
export class FashionResearchInvalidUrlError extends Error {
  /** @param url - Rejected raw URL string. */
  constructor(readonly url: string) {
    super('fashion research invalid url')
    this.name = 'FashionResearchInvalidUrlError'
  }
}

/** Input failed Host validation beyond a dedicated typed error. */
export class FashionResearchInvalidInputError extends Error {
  /** @param reason - Stable machine-readable reason token. */
  constructor(readonly reason: string) {
    super(`fashion research invalid input: ${reason}`)
    this.name = 'FashionResearchInvalidInputError'
  }
}

/** Status or review transition is not admitted. */
export class FashionResearchInvalidTransitionError extends Error {
  /** @param reason - Stable machine-readable reason token. */
  constructor(readonly reason: string) {
    super(`fashion research invalid transition: ${reason}`)
    this.name = 'FashionResearchInvalidTransitionError'
  }
}

/** Update/review carried a stale expectedRevision. */
export class FashionResearchRevisionConflictError extends Error {
  /**
   * @param id - Object identity string.
   * @param expectedRevision - Caller-supplied revision.
   * @param actualRevision - Durable revision.
   */
  constructor(
    readonly id: string,
    readonly expectedRevision: number,
    readonly actualRevision: number,
  ) {
    super(`fashion research revision conflict for '${id}': expected ${expectedRevision}, actual ${actualRevision}`)
    this.name = 'FashionResearchRevisionConflictError'
  }
}

/** Attachment locator or reference failed Host checks. */
export class FashionResearchAttachmentInvalidError extends Error {
  /** @param reason - Stable machine-readable reason token. */
  constructor(readonly reason: string) {
    super(`fashion research attachment invalid: ${reason}`)
    this.name = 'FashionResearchAttachmentInvalidError'
  }
}

/** Usage boundary forbids the requested operation. */
export class FashionResearchUsageBoundaryDeniedError extends Error {
  /** @param reason - Stable machine-readable reason token. */
  constructor(readonly reason: string) {
    super(`fashion research usage boundary denied: ${reason}`)
    this.name = 'FashionResearchUsageBoundaryDeniedError'
  }
}

/**
 * Reserved R0 research seed exists with drifted invariants.
 * Startup must fail; silent overwrite is forbidden.
 */
export class FashionResearchSeedConflictError extends Error {
  /** @param projectId - Conflicting reserved Project id. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion research seed conflict for project '${projectId}'`)
    this.name = 'FashionResearchSeedConflictError'
  }
}

/** A newly minted research object id already occupied a table key after regeneration. */
export class FashionResearchIdCollisionError extends Error {
  /** @param id - Conflicting identity string. */
  constructor(readonly id: string) {
    super(`fashion research id collision for '${id}'`)
    this.name = 'FashionResearchIdCollisionError'
  }
}
