/**
 * Domain errors for Fashion Analysis registry operations.
 * @module @gentlexx/dsh-fashion-analysis/src/errors
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { EvidenceId, ResearchTaskId } from '@gentlexx/dsh-fashion-research/types'
import type {
  AttributeAssertionId,
  DesignOpportunityId,
  MarketItemId,
  OntologyVersionId,
  PopularitySignalId,
  TrendClusterId,
} from './types.ts'

/** Requested Project id is absent. */
export class FashionAnalysisProjectNotFoundError extends Error {
  /** @param projectId - Missing project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion analysis project not found: '${projectId}'`)
    this.name = 'FashionAnalysisProjectNotFoundError'
  }
}

/** Requested ResearchTask id is absent. */
export class FashionAnalysisTaskNotFoundError extends Error {
  /** @param taskId - Missing task identity. */
  constructor(readonly taskId: ResearchTaskId) {
    super(`fashion analysis task not found: '${taskId}'`)
    this.name = 'FashionAnalysisTaskNotFoundError'
  }
}

/** Requested MarketItem id is absent. */
export class FashionAnalysisItemNotFoundError extends Error {
  /** @param marketItemId - Missing item identity. */
  constructor(readonly marketItemId: MarketItemId) {
    super(`fashion analysis market item not found: '${marketItemId}'`)
    this.name = 'FashionAnalysisItemNotFoundError'
  }
}

/** Requested PopularitySignal id is absent. */
export class FashionAnalysisSignalNotFoundError extends Error {
  /** @param signalId - Missing signal identity. */
  constructor(readonly signalId: PopularitySignalId) {
    super(`fashion analysis signal not found: '${signalId}'`)
    this.name = 'FashionAnalysisSignalNotFoundError'
  }
}

/** Requested TrendCluster id is absent. */
export class FashionAnalysisClusterNotFoundError extends Error {
  /** @param clusterId - Missing cluster identity. */
  constructor(readonly clusterId: TrendClusterId) {
    super(`fashion analysis cluster not found: '${clusterId}'`)
    this.name = 'FashionAnalysisClusterNotFoundError'
  }
}

/** Requested DesignOpportunity id is absent. */
export class FashionAnalysisOpportunityNotFoundError extends Error {
  /** @param opportunityId - Missing opportunity identity. */
  constructor(readonly opportunityId: DesignOpportunityId) {
    super(`fashion analysis opportunity not found: '${opportunityId}'`)
    this.name = 'FashionAnalysisOpportunityNotFoundError'
  }
}

/** Requested AttributeAssertion id is absent. */
export class FashionAnalysisAssertionNotFoundError extends Error {
  /** @param assertionId - Missing assertion identity. */
  constructor(readonly assertionId: AttributeAssertionId) {
    super(`fashion analysis assertion not found: '${assertionId}'`)
    this.name = 'FashionAnalysisAssertionNotFoundError'
  }
}

/** Requested OntologyVersion id is absent. */
export class FashionAnalysisOntologyNotFoundError extends Error {
  /** @param ontologyVersionId - Missing ontology version identity. */
  constructor(readonly ontologyVersionId: OntologyVersionId) {
    super(`fashion analysis ontology not found: '${ontologyVersionId}'`)
    this.name = 'FashionAnalysisOntologyNotFoundError'
  }
}

/** Write refused because the owning Project or object is read-only. */
export class FashionAnalysisProjectReadOnlyError extends Error {
  /** @param projectId - Read-only project identity. */
  constructor(readonly projectId: ProjectId) {
    super(`fashion analysis project is read-only: '${projectId}'`)
    this.name = 'FashionAnalysisProjectReadOnlyError'
  }
}

/** Parent-chain ids belong to different projects. */
export class FashionAnalysisCrossProjectReferenceError extends Error {
  /**
   * @param projectId - Expected project.
   * @param otherProjectId - Observed foreign project.
   */
  constructor(
    readonly projectId: ProjectId,
    readonly otherProjectId: ProjectId,
  ) {
    super(`fashion analysis cross-project reference: expected '${projectId}', got '${otherProjectId}'`)
    this.name = 'FashionAnalysisCrossProjectReferenceError'
  }
}

/** Parent-chain ids belong to different tasks. */
export class FashionAnalysisCrossTaskReferenceError extends Error {
  /**
   * @param taskId - Expected task.
   * @param otherTaskId - Observed foreign task.
   */
  constructor(
    readonly taskId: ResearchTaskId,
    readonly otherTaskId: ResearchTaskId,
  ) {
    super(`fashion analysis cross-task reference: expected '${taskId}', got '${otherTaskId}'`)
    this.name = 'FashionAnalysisCrossTaskReferenceError'
  }
}

/** Optimistic concurrency mismatch. */
export class FashionAnalysisRevisionConflictError extends Error {
  /**
   * @param expected - Caller expectedRevision.
   * @param actual - Stored revision.
   */
  constructor(
    readonly expected: number,
    readonly actual: number,
  ) {
    super(`fashion analysis revision conflict: expected ${expected}, actual ${actual}`)
    this.name = 'FashionAnalysisRevisionConflictError'
  }
}

/** Input failed domain validation. */
export class FashionAnalysisInvalidInputError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion analysis invalid input: ${reason}`)
    this.name = 'FashionAnalysisInvalidInputError'
  }
}

/** Lifecycle transition refused. */
export class FashionAnalysisInvalidTransitionError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion analysis invalid transition: ${reason}`)
    this.name = 'FashionAnalysisInvalidTransitionError'
  }
}

/** R0 analysis seed drifted or partially missing. */
export class FashionAnalysisSeedConflictError extends Error {
  /** @param reason - Stable machine reason code. */
  constructor(readonly reason: string) {
    super(`fashion analysis seed conflict: ${reason}`)
    this.name = 'FashionAnalysisSeedConflictError'
  }
}

/** Evidence is not eligible as formal analysis input. */
export class FashionAnalysisEvidenceNotEligibleError extends Error {
  /** @param evidenceId - Rejected evidence identity. */
  constructor(readonly evidenceId: EvidenceId) {
    super(`fashion analysis evidence not eligible: '${evidenceId}'`)
    this.name = 'FashionAnalysisEvidenceNotEligibleError'
  }
}

/** Id mint collided twice. */
export class FashionAnalysisIdCollisionError extends Error {
  /** @param id - Colliding identity string. */
  constructor(readonly id: string) {
    super(`fashion analysis id collision: '${id}'`)
    this.name = 'FashionAnalysisIdCollisionError'
  }
}
