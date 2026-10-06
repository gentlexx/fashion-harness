/**
 * Fashion Design registry (`ctx.fashionDesignRegistry`): durable
 * Brief / ConceptSet / DesignConcept / VisualDraft / Review / Deliverable over
 * Storage Domain `fashion_design@1`.
 * @module @gentlexx/dsh-fashion-design
 */

import {
  ApprovalInvalidationId as brandApprovalInvalidationId,
  ConceptSetId as brandConceptSetId,
  DeliverableSnapshotId as brandDeliverableSnapshotId,
  DesignArtifactId as brandDesignArtifactId,
  DesignBriefId as brandDesignBriefId,
  DesignConceptId as brandDesignConceptId,
  DesignDeliverableId as brandDesignDeliverableId,
  ExportArtifactId as brandExportArtifactId,
  ReviewDecisionId as brandReviewDecisionId,
  ReviewRoundId as brandReviewRoundId,
  SourceManifestId as brandSourceManifestId,
  VisualDraftId as brandVisualDraftId,
} from './ids.ts'
import type {
  ApprovalInvalidationId as ApprovalInvalidationIdBrand,
  ConceptSetId as ConceptSetIdBrand,
  DeliverableSnapshotId as DeliverableSnapshotIdBrand,
  DesignArtifactId as DesignArtifactIdBrand,
  DesignBriefId as DesignBriefIdBrand,
  DesignConceptId as DesignConceptIdBrand,
  DesignDeliverableId as DesignDeliverableIdBrand,
  ExportArtifactId as ExportArtifactIdBrand,
  ReviewDecisionId as ReviewDecisionIdBrand,
  ReviewRoundId as ReviewRoundIdBrand,
  SourceManifestId as SourceManifestIdBrand,
  VisualDraftId as VisualDraftIdBrand,
} from './types.ts'

export type {
  ActorRef,
  ApprovalInvalidation,
  ApprovalInvalidationCause,
  ApprovalValidity,
  AttributeConsistencyCheck,
  AudienceProfile,
  BriefConfirmation,
  BriefStatus,
  ConceptLifecycleStatus,
  ConceptRef,
  ConceptSet,
  ConsistencyCheckStatus,
  ConstraintClaimType,
  ConstraintCoverage,
  ConstraintEntry,
  ContentCredentialInfo,
  ContentCredentialStatus,
  DeliverablePreview,
  DeliverableStatus,
  DesignAccessMode,
  DesignArtifact,
  DesignDeliverable,
  DesignEnvelope,
  DesignOpportunityBrief,
  DesignOrigin,
  DesignConcept,
  DifferentiationCheck,
  DifferentiationDimension,
  ExactRef,
  ExportArtifactView,
  MarketEvidenceLink,
  PairwiseDifference,
  PriceTarget,
  PriceTargetStatus,
  ReadinessCheck,
  ReviewActorKind,
  ReviewDecision,
  ReviewDecisionAction,
  ReviewRound,
  ReviewRoundStatus,
  SimilarityRisk,
  SimilarityRiskLevel,
  SourceInclusion,
  SourceManifestEntry,
  VisualDraft,
  VisualDraftStatus,
  VisualGenerationMode,
  VisualHumanReviewStatus,
} from './types.ts'
export { FASHION_DESIGN_SCHEMA_VERSION } from './types.ts'

/** Branded identities; factories below share these names. */
export type ConceptSetId = ConceptSetIdBrand
export type DesignArtifactId = DesignArtifactIdBrand
export type DesignBriefId = DesignBriefIdBrand
export type DesignConceptId = DesignConceptIdBrand
export type VisualDraftId = VisualDraftIdBrand
export type ReviewRoundId = ReviewRoundIdBrand
export type ReviewDecisionId = ReviewDecisionIdBrand
export type ApprovalInvalidationId = ApprovalInvalidationIdBrand
export type DeliverableSnapshotId = DeliverableSnapshotIdBrand
export type SourceManifestId = SourceManifestIdBrand
export type DesignDeliverableId = DesignDeliverableIdBrand
export type ExportArtifactId = ExportArtifactIdBrand

/** @param id - Raw id. @returns branded DesignBriefId. */
export function DesignBriefId(id: string): DesignBriefId {
  return brandDesignBriefId(id)
}
/** @param id - Raw id. @returns branded ConceptSetId. */
export function ConceptSetId(id: string): ConceptSetId {
  return brandConceptSetId(id)
}
/** @param id - Raw id. @returns branded DesignConceptId. */
export function DesignConceptId(id: string): DesignConceptId {
  return brandDesignConceptId(id)
}
/** @param id - Raw id. @returns branded VisualDraftId. */
export function VisualDraftId(id: string): VisualDraftId {
  return brandVisualDraftId(id)
}
/** @param id - Raw id. @returns branded DesignArtifactId. */
export function DesignArtifactId(id: string): DesignArtifactId {
  return brandDesignArtifactId(id)
}
/** @param id - Raw id. @returns branded ReviewRoundId. */
export function ReviewRoundId(id: string): ReviewRoundId {
  return brandReviewRoundId(id)
}
/** @param id - Raw id. @returns branded ReviewDecisionId. */
export function ReviewDecisionId(id: string): ReviewDecisionId {
  return brandReviewDecisionId(id)
}
/** @param id - Raw id. @returns branded ApprovalInvalidationId. */
export function ApprovalInvalidationId(id: string): ApprovalInvalidationId {
  return brandApprovalInvalidationId(id)
}
/** @param id - Raw id. @returns branded DeliverableSnapshotId. */
export function DeliverableSnapshotId(id: string): DeliverableSnapshotId {
  return brandDeliverableSnapshotId(id)
}
/** @param id - Raw id. @returns branded SourceManifestId. */
export function SourceManifestId(id: string): SourceManifestId {
  return brandSourceManifestId(id)
}
/** @param id - Raw id. @returns branded DesignDeliverableId. */
export function DesignDeliverableId(id: string): DesignDeliverableId {
  return brandDesignDeliverableId(id)
}
/** @param id - Raw id. @returns branded ExportArtifactId. */
export function ExportArtifactId(id: string): ExportArtifactId {
  return brandExportArtifactId(id)
}

export {
  FashionDesignApprovalInvalidError,
  FashionDesignBlockingConditionError,
  FashionDesignBriefNotConfirmedError,
  FashionDesignBriefNotFoundError,
  FashionDesignCanonicalizationFailedError,
  FashionDesignConceptCountInvalidError,
  FashionDesignConceptNotFoundError,
  FashionDesignConceptNotInRoundError,
  FashionDesignConceptSetNotFoundError,
  FashionDesignConceptSetNotReadyError,
  FashionDesignCrossProjectReferenceError,
  FashionDesignDeliverableNotFoundError,
  FashionDesignDifferentiationFailedError,
  FashionDesignHumanRequiredError,
  FashionDesignIdCollisionError,
  FashionDesignIdempotencyConflictError,
  FashionDesignIntegrityMismatchError,
  FashionDesignInvalidInputError,
  FashionDesignInvalidTransitionError,
  FashionDesignProjectNotFoundError,
  FashionDesignProjectReadOnlyError,
  FashionDesignRenderFailedError,
  FashionDesignReviewAlreadyOpenError,
  FashionDesignReviewClosedError,
  FashionDesignReviewNotFoundError,
  FashionDesignRevisionConflictError,
  FashionDesignSeedConflictError,
  FashionDesignSelectionRequiredError,
  FashionDesignUpstreamNotSelectedError,
  FashionDesignUpstreamStaleError,
  FashionDesignVisualDraftNotFoundError,
} from './errors.ts'

export { compareDesignUpdatedDesc } from './order.ts'
export type { DesignListOrderable } from './order.ts'

export {
  DIFFERENTIATION_RULE_VERSION,
  STRUCTURAL_DIMENSIONS,
  evaluateDifferentiation,
} from './differentiation.ts'

export {
  AUDIENCE_FILTER_RULE_VERSION,
  DELIVERABLE_RENDERER_VERSION,
  decideInclusion,
  filterManifestEntries,
  projectConceptForAudience,
  restrictedLocatorKind,
} from './export/filter.ts'
export type { DecisionConceptFields } from './export/filter.ts'
export { hashSnapshotPayload, jcsCanonicalize, sha256Hex } from './export/jcs.ts'
export { renderDecisionPackage } from './export/render.ts'
export type { RenderedExportBundle } from './export/render.ts'

export {
  fashionDesignDomainSpec,
  FASHION_DESIGN_DOMAIN_VERSION,
} from './spec.ts'
export type {
  ConceptSetRecordV0,
  DesignArtifactRecordV0,
  DesignBriefRecordV0,
  DesignConceptRecordV0,
  VisualDraftRecordV0,
  ApprovalInvalidationRecordV0,
  DeliverableSnapshotRecordV0,
  DesignDeliverableRecordV0,
  ExportArtifactRecordV0,
  ReviewDecisionRecordV0,
  ReviewRoundRecordV0,
  SourceManifestRecordV0,
} from './spec.ts'

export {
  isValidR0DesignSeed,
  R0_ARTIFACT_SEEDS,
  R0_BRIEF_ID,
  R0_BRIEF_SEED,
  R0_CONCEPT_CROPPED_ID,
  R0_CONCEPT_LIGHT_ID,
  R0_CONCEPT_SEEDS,
  R0_CONCEPT_SET_ID,
  R0_CONCEPT_SET_SEED,
  R0_CONCEPT_URBAN_ID,
  R0_VISUAL_CROPPED_ID,
  R0_VISUAL_LIGHT_ID,
  R0_VISUAL_SEEDS,
  R0_VISUAL_URBAN_ID,
} from './seed/r0-design.ts'

export { FashionDesignRegistry } from './registry-f302.ts'
export { FashionDesignRegistry as default } from './registry-f302.ts'
