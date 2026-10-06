/**
 * Domain errors for Fashion Design registry operations.
 * @module @gentlexx/dsh-fashion-design/src/errors
 */

import type { DesignOpportunityId } from '@gentlexx/dsh-fashion-analysis/types'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  ConceptSetId,
  DesignBriefId,
  DesignConceptId,
  VisualDraftId,
} from './types.ts'

/** Requested Project id is absent. */
export class FashionDesignProjectNotFoundError extends Error {
  /** @param projectId - Missing project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion design project not found: '${projectId}'`)
    this.name = 'FashionDesignProjectNotFoundError'
  }
}

/** Requested Brief id is absent. */
export class FashionDesignBriefNotFoundError extends Error {
  /** @param briefId - Missing brief identity. */
  constructor(readonly briefId: DesignBriefId) {
    super(`fashion design brief not found: '${briefId}'`)
    this.name = 'FashionDesignBriefNotFoundError'
  }
}

/** Requested ConceptSet id is absent. */
export class FashionDesignConceptSetNotFoundError extends Error {
  /** @param conceptSetId - Missing concept set identity. */
  constructor(readonly conceptSetId: ConceptSetId) {
    super(`fashion design concept set not found: '${conceptSetId}'`)
    this.name = 'FashionDesignConceptSetNotFoundError'
  }
}

/** Requested DesignConcept id is absent. */
export class FashionDesignConceptNotFoundError extends Error {
  /** @param conceptId - Missing concept identity. */
  constructor(readonly conceptId: DesignConceptId) {
    super(`fashion design concept not found: '${conceptId}'`)
    this.name = 'FashionDesignConceptNotFoundError'
  }
}

/** Requested VisualDraft id is absent. */
export class FashionDesignVisualDraftNotFoundError extends Error {
  /** @param visualDraftId - Missing visual draft identity. */
  constructor(readonly visualDraftId: VisualDraftId) {
    super(`fashion design visual draft not found: '${visualDraftId}'`)
    this.name = 'FashionDesignVisualDraftNotFoundError'
  }
}

/** Write refused because the owning Project or object is read-only. */
export class FashionDesignProjectReadOnlyError extends Error {
  /** @param projectId - Read-only project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion design project is read-only: '${projectId}'`)
    this.name = 'FashionDesignProjectReadOnlyError'
  }
}

/** Parent-chain ids belong to different projects. */
export class FashionDesignCrossProjectReferenceError extends Error {
  /**
   * @param projectId - Expected project.
   * @param otherProjectId - Observed foreign project.
   */
  constructor(
    readonly projectId: ProjectId,
    readonly otherProjectId: ProjectId,
  ) {
    super(`fashion design cross-project reference: expected '${projectId}', got '${otherProjectId}'`)
    this.name = 'FashionDesignCrossProjectReferenceError'
  }
}

/** Optimistic concurrency mismatch. */
export class FashionDesignRevisionConflictError extends Error {
  /**
   * @param expected - Caller expectedRevision.
   * @param actual - Stored revision.
   */
  constructor(
    readonly expected: number,
    readonly actual: number,
  ) {
    super(`fashion design revision conflict: expected ${expected}, actual ${actual}`)
    this.name = 'FashionDesignRevisionConflictError'
  }
}

/** Input failed domain validation. */
export class FashionDesignInvalidInputError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion design invalid input: ${reason}`)
    this.name = 'FashionDesignInvalidInputError'
  }
}

/** Lifecycle transition refused. */
export class FashionDesignInvalidTransitionError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion design invalid transition: ${reason}`)
    this.name = 'FashionDesignInvalidTransitionError'
  }
}

/** Upstream Opportunity is not human-selected. */
export class FashionDesignUpstreamNotSelectedError extends Error {
  /** @param opportunityId - Rejected opportunity. */
  constructor(readonly opportunityId: DesignOpportunityId) {
    super(`fashion design upstream opportunity not selected: '${opportunityId}'`)
    this.name = 'FashionDesignUpstreamNotSelectedError'
  }
}

/** Upstream Opportunity or Decision is stale / mismatched. */
export class FashionDesignUpstreamStaleError extends Error {
  /** @param opportunityId - Stale opportunity. */
  constructor(readonly opportunityId: DesignOpportunityId) {
    super(`fashion design upstream opportunity stale: '${opportunityId}'`)
    this.name = 'FashionDesignUpstreamStaleError'
  }
}

/** Brief must be confirmed before ConceptSet work. */
export class FashionDesignBriefNotConfirmedError extends Error {
  /** @param briefId - Unconfirmed brief. */
  constructor(readonly briefId: DesignBriefId) {
    super(`fashion design brief not confirmed: '${briefId}'`)
    this.name = 'FashionDesignBriefNotConfirmedError'
  }
}

/** ConceptSet member count invalid for the requested transition. */
export class FashionDesignConceptCountInvalidError extends Error {
  /** @param count - Observed member count. */
  constructor(readonly count: number) {
    super(`fashion design concept count invalid: ${count}`)
    this.name = 'FashionDesignConceptCountInvalidError'
  }
}

/** Pairwise differentiation failed. */
export class FashionDesignDifferentiationFailedError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion design differentiation failed: ${reason}`)
    this.name = 'FashionDesignDifferentiationFailedError'
  }
}

/** R0 design seed drifted or partially missing. */
export class FashionDesignSeedConflictError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion design seed conflict: ${reason}`)
    this.name = 'FashionDesignSeedConflictError'
  }
}

/** Operation requires a human actor. */
export class FashionDesignHumanRequiredError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion design human required: ${reason}`)
    this.name = 'FashionDesignHumanRequiredError'
  }
}

/** Id mint collided twice. */
export class FashionDesignIdCollisionError extends Error {
  /** @param id - Colliding identity string. */
  constructor(readonly id: string) {
    super(`fashion design id collision: '${id}'`)
    this.name = 'FashionDesignIdCollisionError'
  }
}

/** ReviewRound missing. */
export class FashionDesignReviewNotFoundError extends Error {
  /** @param reviewRoundId - Missing round. */
  constructor(readonly reviewRoundId: string) {
    super(`fashion design review not found: '${reviewRoundId}'`)
    this.name = 'FashionDesignReviewNotFoundError'
  }
}

/** ConceptSet is not review_ready / is stale. */
export class FashionDesignConceptSetNotReadyError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design concept set not ready: ${reason}`)
    this.name = 'FashionDesignConceptSetNotReadyError'
  }
}

/** Another open ReviewRound already exists for this ConceptSet revision. */
export class FashionDesignReviewAlreadyOpenError extends Error {
  /** @param reviewRoundId - Existing open round. */
  constructor(readonly reviewRoundId: string) {
    super(`fashion design review already open: '${reviewRoundId}'`)
    this.name = 'FashionDesignReviewAlreadyOpenError'
  }
}

/** ReviewRound is closed for the requested mutation. */
export class FashionDesignReviewClosedError extends Error {
  /** @param reviewRoundId - Closed round. */
  constructor(readonly reviewRoundId: string) {
    super(`fashion design review closed: '${reviewRoundId}'`)
    this.name = 'FashionDesignReviewClosedError'
  }
}

/** Concept is not a member of the ReviewRound exact refs. */
export class FashionDesignConceptNotInRoundError extends Error {
  /** @param conceptId - Rejected concept. */
  constructor(readonly conceptId: string) {
    super(`fashion design concept not in round: '${conceptId}'`)
    this.name = 'FashionDesignConceptNotInRoundError'
  }
}

/** Approve requires a current select on the same exact Concept revision. */
export class FashionDesignSelectionRequiredError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design selection required: ${reason}`)
    this.name = 'FashionDesignSelectionRequiredError'
  }
}

/** Approve blocked by unresolved blocking conditions. */
export class FashionDesignBlockingConditionError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design blocking condition: ${reason}`)
    this.name = 'FashionDesignBlockingConditionError'
  }
}

/** Approval is not currently valid. */
export class FashionDesignApprovalInvalidError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design approval invalid: ${reason}`)
    this.name = 'FashionDesignApprovalInvalidError'
  }
}

/** Deliverable missing. */
export class FashionDesignDeliverableNotFoundError extends Error {
  /** @param deliverableId - Missing deliverable. */
  constructor(readonly deliverableId: string) {
    super(`fashion design deliverable not found: '${deliverableId}'`)
    this.name = 'FashionDesignDeliverableNotFoundError'
  }
}

/** JCS canonicalization failed. */
export class FashionDesignCanonicalizationFailedError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design canonicalization failed: ${reason}`)
    this.name = 'FashionDesignCanonicalizationFailedError'
  }
}

/** Export render failed. */
export class FashionDesignRenderFailedError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design render failed: ${reason}`)
    this.name = 'FashionDesignRenderFailedError'
  }
}

/** Same idempotency key was reused with a different export identity. */
export class FashionDesignIdempotencyConflictError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design idempotency conflict: ${reason}`)
    this.name = 'FashionDesignIdempotencyConflictError'
  }
}

/** Artifact integrity mismatch. */
export class FashionDesignIntegrityMismatchError extends Error {
  /** @param reason - Stable machine reason. */
  constructor(readonly reason: string) {
    super(`fashion design integrity mismatch: ${reason}`)
    this.name = 'FashionDesignIntegrityMismatchError'
  }
}
