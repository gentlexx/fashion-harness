/**
 * Fashion Evaluation domain errors.
 * @module @gentlexx/dsh-fashion-evaluation/src/errors
 */

/** Base evaluation error. */
export class FashionEvaluationError extends Error {
  /** @param code - Stable remote code suffix. @param message - Human message. */
  constructor(readonly code: string, message: string) {
    super(message)
    this.name = 'FashionEvaluationError'
  }
}

/** Row was not found. */
export class FashionEvaluationNotFoundError extends FashionEvaluationError {
  /** @param id - Missing identity. */
  constructor(id: string) {
    super('not-found', `evaluation record not found: ${id}`)
    this.name = 'FashionEvaluationNotFoundError'
  }
}

/** Cross-project exact ref. */
export class FashionEvaluationCrossProjectError extends FashionEvaluationError {
  /** @param expected - Requested project. @param actual - Found project. */
  constructor(expected: string, actual: string) {
    super('cross-project', `evaluation cross-project: expected ${expected}, got ${actual}`)
    this.name = 'FashionEvaluationCrossProjectError'
  }
}

/** R0 or read-only project refused a mutation. */
export class FashionEvaluationProjectReadOnlyError extends FashionEvaluationError {
  /** @param projectId - Read-only project. */
  constructor(projectId: string) {
    super('project-read-only', `evaluation project is read-only: ${projectId}`)
    this.name = 'FashionEvaluationProjectReadOnlyError'
  }
}

/** Definition is not published. */
export class FashionEvaluationDefinitionNotPublishedError extends FashionEvaluationError {
  /** @param id - Definition id. */
  constructor(id: string) {
    super('definition-not-published', `definition is not published: ${id}`)
    this.name = 'FashionEvaluationDefinitionNotPublishedError'
  }
}

/** Case is not published. */
export class FashionEvaluationCaseNotPublishedError extends FashionEvaluationError {
  /** @param id - Case id. */
  constructor(id: string) {
    super('case-not-published', `case is not published: ${id}`)
    this.name = 'FashionEvaluationCaseNotPublishedError'
  }
}

/** Version or head conflict. */
export class FashionEvaluationVersionConflictError extends FashionEvaluationError {
  /** @param detail - Conflict detail. */
  constructor(detail: string) {
    super('version-conflict', `evaluation version conflict: ${detail}`)
    this.name = 'FashionEvaluationVersionConflictError'
  }
}

/** Human actor was forged or missing. */
export class FashionEvaluationHumanRequiredError extends FashionEvaluationError {
  /** @param detail - Actor detail. */
  constructor(detail: string) {
    super('human-required', `evaluation human required: ${detail}`)
    this.name = 'FashionEvaluationHumanRequiredError'
  }
}

/** Assessment supersedes head conflict. */
export class FashionEvaluationAssessmentHeadConflictError extends FashionEvaluationError {
  /** @param expected - Expected head. @param actual - Actual head. */
  constructor(expected: string, actual: string) {
    super('assessment-head-conflict', `assessment head conflict: expected ${expected}, got ${actual}`)
    this.name = 'FashionEvaluationAssessmentHeadConflictError'
  }
}

/** Invalid improvement transition. */
export class FashionEvaluationImprovementTransitionError extends FashionEvaluationError {
  /** @param detail - Transition detail. */
  constructor(detail: string) {
    super('improvement-transition-invalid', `improvement transition invalid: ${detail}`)
    this.name = 'FashionEvaluationImprovementTransitionError'
  }
}

/** Planner confirmation missing. */
export class FashionEvaluationPlannerConfirmationError extends FashionEvaluationError {
  /** @param detail - Confirmation detail. */
  constructor(detail: string) {
    super('planner-confirmation-required', `planner confirmation required: ${detail}`)
    this.name = 'FashionEvaluationPlannerConfirmationError'
  }
}

/** R0 seed drift. */
export class FashionEvaluationSeedConflictError extends FashionEvaluationError {
  /** @param detail - Seed conflict. */
  constructor(detail: string) {
    super('seed-conflict', `evaluation seed conflict: ${detail}`)
    this.name = 'FashionEvaluationSeedConflictError'
  }
}

/** Invalid input. */
export class FashionEvaluationInvalidInputError extends FashionEvaluationError {
  /** @param detail - Input detail. */
  constructor(detail: string) {
    super('invalid-expected-outcome', `evaluation invalid input: ${detail}`)
    this.name = 'FashionEvaluationInvalidInputError'
  }
}

/** Project missing. */
export class FashionEvaluationProjectNotFoundError extends FashionEvaluationError {
  /** @param projectId - Missing project. */
  constructor(projectId: string) {
    super('not-found', `evaluation project not found: ${projectId}`)
    this.name = 'FashionEvaluationProjectNotFoundError'
  }
}
