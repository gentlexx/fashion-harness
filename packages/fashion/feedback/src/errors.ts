/**
 * Domain errors for Fashion Feedback registry operations.
 * @module @gentlexx/dsh-fashion-feedback/src/errors
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'

/** Requested Project id is absent. */
export class FashionFeedbackProjectNotFoundError extends Error {
  /** @param projectId - Missing project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion feedback project not found: '${projectId}'`)
    this.name = 'FashionFeedbackProjectNotFoundError'
  }
}

/** Requested record id is absent. */
export class FashionFeedbackNotFoundError extends Error {
  /** @param id - Missing record identity. */
  constructor(readonly id: string) {
    super(`fashion feedback record not found: '${id}'`)
    this.name = 'FashionFeedbackNotFoundError'
  }
}

/** Write refused because the owning Project is read-only. */
export class FashionFeedbackProjectReadOnlyError extends Error {
  /** @param projectId - Read-only project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion feedback project is read-only: '${projectId}'`)
    this.name = 'FashionFeedbackProjectReadOnlyError'
  }
}

/** Parent-chain ids belong to different projects. */
export class FashionFeedbackCrossProjectError extends Error {
  /**
   * @param projectId - Expected project.
   * @param otherProjectId - Observed foreign project.
   */
  constructor(
    readonly projectId: ProjectId,
    readonly otherProjectId: string,
  ) {
    super(`fashion feedback cross-project reference: expected '${projectId}', got '${otherProjectId}'`)
    this.name = 'FashionFeedbackCrossProjectError'
  }
}

/** Upstream subject id does not resolve. */
export class FashionFeedbackTargetRevisionMissingError extends Error {
  /** @param subjectId - Unresolved subject identity. */
  constructor(readonly subjectId: string) {
    super(`fashion feedback target revision missing: '${subjectId}'`)
    this.name = 'FashionFeedbackTargetRevisionMissingError'
  }
}

/** Upstream subject exists at a different revision. */
export class FashionFeedbackTargetStaleError extends Error {
  /**
   * @param subjectId - Subject identity.
   * @param expected - Caller expected revision.
   * @param actual - Stored revision.
   */
  constructor(
    readonly subjectId: string,
    readonly expected: number,
    readonly actual: number,
  ) {
    super(`fashion feedback target stale: '${subjectId}' expected ${expected}, actual ${actual}`)
    this.name = 'FashionFeedbackTargetStaleError'
  }
}

/** Input failed domain validation. */
export class FashionFeedbackInvalidInputError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback invalid input: ${reason}`)
    this.name = 'FashionFeedbackInvalidInputError'
  }
}

/** Lifecycle transition refused. */
export class FashionFeedbackInvalidTransitionError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback invalid transition: ${reason}`)
    this.name = 'FashionFeedbackInvalidTransitionError'
  }
}

/** Idempotency key reused with a different payload. */
export class FashionFeedbackRevisionConflictError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback revision conflict: ${reason}`)
    this.name = 'FashionFeedbackRevisionConflictError'
  }
}

/** Actor is not a local human or a recorded demo seed. */
export class FashionFeedbackHumanRequiredError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback human required: ${reason}`)
    this.name = 'FashionFeedbackHumanRequiredError'
  }
}

/** Supersede did not target the current chain head. */
export class FashionFeedbackSupersedesConflictError extends Error {
  /**
   * @param expectedHead - Caller expected head.
   * @param actualHead - Current head.
   */
  constructor(
    readonly expectedHead: string,
    readonly actualHead: string,
  ) {
    super(`fashion feedback supersedes conflict: expected '${expectedHead}', actual '${actualHead}'`)
    this.name = 'FashionFeedbackSupersedesConflictError'
  }
}

/** Unknown availability must not be stored as numeric zero. */
export class FashionFeedbackAvailabilityValueForbiddenError extends Error {
  /** @param availability - Availability state that forbids a numeric observation. */
  constructor(readonly availability: string) {
    super(`fashion feedback availability forbids a numeric value: ${availability}`)
    this.name = 'FashionFeedbackAvailabilityValueForbiddenError'
  }
}

/** Metric value does not match its definition. */
export class FashionFeedbackMetricDefinitionMismatchError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback metric definition mismatch: ${reason}`)
    this.name = 'FashionFeedbackMetricDefinitionMismatchError'
  }
}

/** Units, currencies, channels, or windows cannot be added together. */
export class FashionFeedbackUnitMismatchError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback unit mismatch: ${reason}`)
    this.name = 'FashionFeedbackUnitMismatchError'
  }
}

/** Currency metric is missing an ISO currency code. */
export class FashionFeedbackCurrencyRequiredError extends Error {
  /** @param metricKey - Metric that requires currency. */
  constructor(readonly metricKey: string) {
    super(`fashion feedback currency required: '${metricKey}'`)
    this.name = 'FashionFeedbackCurrencyRequiredError'
  }
}

/** Measurement window is missing or inverted. */
export class FashionFeedbackInvalidWindowError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback invalid window: ${reason}`)
    this.name = 'FashionFeedbackInvalidWindowError'
  }
}

/** Source reference is missing or unstructured. */
export class FashionFeedbackSourceRequiredError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback source required: ${reason}`)
    this.name = 'FashionFeedbackSourceRequiredError'
  }
}

/** Source was withdrawn; content is no longer readable. */
export class FashionFeedbackSourceRestrictedError extends Error {
  /** @param ref - Restricted source ref. */
  constructor(readonly ref: string) {
    super(`fashion feedback source restricted: '${ref}'`)
    this.name = 'FashionFeedbackSourceRestrictedError'
  }
}

/** Referenced artifact is absent. */
export class FashionFeedbackArtifactUnavailableError extends Error {
  /** @param ref - Missing artifact ref. */
  constructor(readonly ref: string) {
    super(`fashion feedback artifact unavailable: '${ref}'`)
    this.name = 'FashionFeedbackArtifactUnavailableError'
  }
}

/** R0 feedback seed drifted or partially missing. */
export class FashionFeedbackSeedConflictError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion feedback seed conflict: ${reason}`)
    this.name = 'FashionFeedbackSeedConflictError'
  }
}

/** Id mint collided twice. */
export class FashionFeedbackIdCollisionError extends Error {
  /** @param id - Colliding identity string. */
  constructor(readonly id: string) {
    super(`fashion feedback id collision: '${id}'`)
    this.name = 'FashionFeedbackIdCollisionError'
  }
}
