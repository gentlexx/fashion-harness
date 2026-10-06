/**
 * Public type vocabulary of the Fashion Design domain.
 * Types only — factories and errors live in runtime modules.
 * @module @gentlexx/dsh-fashion-design/src/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'
import type {
  DesignOpportunityId,
  OpportunityDecisionId,
} from '@gentlexx/dsh-fashion-analysis/types'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { ResearchTaskId } from '@gentlexx/dsh-fashion-research/types'
import type {} from '@deepseek-ai/dsh-typert-protocol'

/** Stable DesignOpportunityBrief identity. */
export type DesignBriefId = Branded<'FashionDesignBriefId'>

/** Stable ConceptSet identity. */
export type ConceptSetId = Branded<'FashionConceptSetId'>

/** Stable DesignConcept identity. */
export type DesignConceptId = Branded<'FashionDesignConceptId'>

/** Stable VisualDraft identity. */
export type VisualDraftId = Branded<'FashionVisualDraftId'>

/** Stable DesignArtifact identity (metadata / tombstone only). */
export type DesignArtifactId = Branded<'FashionDesignArtifactId'>

/** Actor admitted without an account system. */
export type ActorRef = 'local-human' | 'system-rule' | 'system-seed'

/** How a design object entered durable storage. */
export type DesignOrigin = 'user' | 'recorded_seed' | 'imported' | 'provider_generated'

/** Whether an object may be mutated by ordinary Host writes. */
export type DesignAccessMode = 'editable' | 'read-only'

/** DesignOpportunityBrief lifecycle. */
export type BriefStatus = 'draft' | 'confirmed' | 'stale' | 'archived'

/** ConceptSet / DesignConcept lifecycle in F3-01 (no approve/reject). */
export type ConceptLifecycleStatus = 'draft' | 'review_ready' | 'stale' | 'archived'

/** VisualDraft job status. */
export type VisualDraftStatus =
  | 'not_requested'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'stale'

/** Visual generation path admitted in v0. */
export type VisualGenerationMode = 'recorded_fixture' | 'manual_upload' | 'provider_generated'

/** Human consistency review of a VisualDraft. */
export type VisualHumanReviewStatus =
  | 'not_reviewed'
  | 'consistent'
  | 'inconsistent'
  | 'needs_revision'

/** Claim type on a Brief constraint entry. */
export type ConstraintClaimType =
  | 'observed'
  | 'human_decision'
  | 'hypothesis'
  | 'needs_validation'

/** Price target knowledge status. */
export type PriceTargetStatus = 'known' | 'hypothesis' | 'unknown'

/** Structural differentiation dimensions (color is supplemental only). */
export type DifferentiationDimension =
  | 'silhouette'
  | 'proportion_and_length'
  | 'material_direction'
  | 'construction_and_details'
  | 'functional_value'
  | 'target_use_scenarios'
  | 'color_direction'

/** Similarity risk level (not a legal conclusion). */
export type SimilarityRiskLevel = 'low' | 'medium' | 'high' | 'unknown'

/** Consistency check outcome on a VisualDraft. */
export type ConsistencyCheckStatus = 'pass' | 'fail' | 'warning' | 'not_applicable'

/** Content Credential availability (C2PA not verified in v0). */
export type ContentCredentialStatus =
  | 'not_available'
  | 'present_unverified'
  | 'verified'
  | 'invalid'

/** Current schema generation stamped on every durable design row. */
export const FASHION_DESIGN_SCHEMA_VERSION = 0

/** Shared durable envelope fields. */
export interface DesignEnvelope {
  readonly projectId: ProjectId
  readonly origin: DesignOrigin
  readonly accessMode: DesignAccessMode
  readonly revision: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly createdBy: ActorRef
  readonly updatedBy: ActorRef
  readonly schemaVersion: typeof FASHION_DESIGN_SCHEMA_VERSION
  readonly archivedAt: string | null
  readonly staleReason: string | null
}

/** One Brief constraint / open-question entry. */
export interface ConstraintEntry {
  readonly id: string
  readonly text: string
  readonly kind: string
  readonly claimType: ConstraintClaimType
  readonly sourceRefs: readonly string[]
  readonly note: string | null
}

/** Optional price target on a Brief. */
export interface PriceTarget {
  readonly amount: string | null
  readonly currency: string | null
  readonly rangeText: string | null
  readonly status: PriceTargetStatus
}

/** Human confirmation stamp on a Brief. */
export interface BriefConfirmation {
  readonly actorId: string
  readonly actorKind: 'human'
  readonly confirmedAt: string
}

/** Authoritative DesignOpportunityBrief projection. */
export interface DesignOpportunityBrief extends DesignEnvelope {
  readonly id: DesignBriefId
  readonly opportunityId: DesignOpportunityId
  readonly opportunityRevision: number
  readonly selectionDecisionId: OpportunityDecisionId
  readonly taskId: ResearchTaskId
  readonly market: string
  readonly season: string
  readonly category: string
  readonly targetUser: string
  readonly brandContext: string | null
  readonly priceTarget: PriceTarget | null
  readonly mustKeep: readonly ConstraintEntry[]
  readonly mustAvoid: readonly ConstraintEntry[]
  readonly materialsConstraints: readonly ConstraintEntry[]
  readonly costConstraints: readonly ConstraintEntry[]
  readonly productionConstraints: readonly ConstraintEntry[]
  readonly differentiationGoals: readonly ConstraintEntry[]
  readonly openQuestions: readonly ConstraintEntry[]
  readonly constraintSources: readonly string[]
  readonly confirmation: BriefConfirmation | null
  readonly status: BriefStatus
}

/** One pairwise differentiation result (ConceptSet projection field). */
export interface PairwiseDifference {
  readonly conceptAId: DesignConceptId
  readonly conceptBId: DesignConceptId
  readonly dimension: DifferentiationDimension
  readonly conceptAValueRef: string
  readonly conceptBValueRef: string
  readonly differenceNote: string
  readonly checkedBy: 'human' | 'system-precheck'
  readonly checkedAt: string
}

/** Differentiation check summary stored on ConceptSet. */
export interface DifferentiationCheck {
  readonly ruleVersion: string
  readonly passed: boolean
  readonly pairwise: readonly PairwiseDifference[]
  readonly failureReasons: readonly string[]
  readonly evaluatedAt: string
}

/** Readiness check summary stored on ConceptSet. */
export interface ReadinessCheck {
  readonly passed: boolean
  readonly failureReasons: readonly string[]
  readonly evaluatedAt: string
}

/** Concept membership ref on a ConceptSet. */
export interface ConceptRef {
  readonly conceptId: DesignConceptId
  readonly conceptRevision: number
}

/** Authoritative ConceptSet projection. */
export interface ConceptSet extends DesignEnvelope {
  readonly id: ConceptSetId
  readonly briefId: DesignBriefId
  readonly briefRevision: number
  readonly conceptRefs: readonly ConceptRef[]
  readonly differentiationRuleVersion: string
  readonly differentiationCheck: DifferentiationCheck | null
  readonly readinessCheck: ReadinessCheck | null
  readonly status: ConceptLifecycleStatus
  readonly isCurrent: boolean
}

/** Market evidence link on a DesignConcept. */
export interface MarketEvidenceLink {
  readonly type: 'evidence' | 'market_item' | 'signal' | 'trend_cluster'
  readonly id: string
  readonly usedFor: string
}

/** Competitor similarity risk (not legal advice). */
export interface SimilarityRisk {
  readonly reference: string
  readonly similarFeature: string
  readonly difference: string
  readonly riskLevel: SimilarityRiskLevel
  readonly needsExpertReview: boolean
  readonly note: string | null
}

/** Constraint coverage row on a Concept. */
export interface ConstraintCoverage {
  readonly constraintId: string
  readonly covered: boolean
  readonly note: string | null
}

/** Authoritative DesignConcept projection. */
export interface DesignConcept extends DesignEnvelope {
  readonly id: DesignConceptId
  readonly conceptSetId: ConceptSetId
  readonly briefId: DesignBriefId
  readonly briefRevision: number
  readonly conceptName: string
  readonly designIntent: string
  readonly silhouette: string
  readonly proportionAndLength: string
  readonly materialDirection: string
  readonly colorDirection: string
  readonly constructionAndDetails: readonly string[]
  readonly functionalValue: readonly string[]
  readonly targetUseScenarios: readonly string[]
  readonly marketEvidenceLinks: readonly MarketEvidenceLink[]
  readonly originalTransformationNotes: readonly string[]
  readonly competitorSimilarityRisks: readonly SimilarityRisk[]
  readonly productionUnknowns: readonly string[]
  readonly constraintCoverage: readonly ConstraintCoverage[]
  readonly status: ConceptLifecycleStatus
}

/** Attribute consistency check on a VisualDraft. */
export interface AttributeConsistencyCheck {
  readonly checkId: string
  readonly status: ConsistencyCheckStatus
  readonly message: string
}

/** Optional Content Credential stub. */
export interface ContentCredentialInfo {
  readonly status: ContentCredentialStatus
  readonly manifestRef: string | null
}

/** Authoritative VisualDraft projection. */
export interface VisualDraft extends DesignEnvelope {
  readonly id: VisualDraftId
  readonly conceptId: DesignConceptId
  readonly conceptRevision: number
  readonly generationMode: VisualGenerationMode
  readonly providerRef: string | null
  readonly modelRef: string | null
  readonly providerJobRef: string | null
  readonly inputSnapshotRef: string
  readonly inputSnapshotHash: string
  readonly promptOrContextRef: string | null
  readonly referenceAssetRefs: readonly string[]
  readonly artifactRef: string | null
  readonly artifactHash: string | null
  readonly mediaType: string | null
  readonly width: number | null
  readonly height: number | null
  readonly requestedAt: string | null
  readonly generatedAt: string | null
  readonly failedAt: string | null
  readonly status: VisualDraftStatus
  readonly failureCode: string | null
  readonly failureMessage: string | null
  readonly attributeConsistencyChecks: readonly AttributeConsistencyCheck[]
  readonly humanReviewStatus: VisualHumanReviewStatus
  readonly usageBoundary: string
  readonly aiDisclosure: string
  readonly contentCredential: ContentCredentialInfo | null
}

/** Artifact metadata / tombstone (no portable absolute paths). */
export interface DesignArtifact extends DesignEnvelope {
  readonly id: DesignArtifactId
  readonly mediaType: string
  readonly contentHash: string | null
  readonly width: number | null
  readonly height: number | null
  readonly projectRelativeRef: string | null
  readonly tombstone: boolean
  readonly tombstoneReason: string | null
  readonly deletedAt: string | null
}

/** Stable ReviewRound identity. */
export type ReviewRoundId = Branded<'FashionReviewRoundId'>

/** Stable ReviewDecision identity. */
export type ReviewDecisionId = Branded<'FashionReviewDecisionId'>

/** Stable ApprovalInvalidation identity. */
export type ApprovalInvalidationId = Branded<'FashionApprovalInvalidationId'>

/** Stable DeliverableSnapshot identity. */
export type DeliverableSnapshotId = Branded<'FashionDeliverableSnapshotId'>

/** Stable SourceManifest identity. */
export type SourceManifestId = Branded<'FashionSourceManifestId'>

/** Stable DesignDeliverable identity. */
export type DesignDeliverableId = Branded<'FashionDesignDeliverableId'>

/** Stable ExportArtifact identity. */
export type ExportArtifactId = Branded<'FashionExportArtifactId'>

/** Exact id + revision reference. */
export interface ExactRef {
  readonly id: string
  readonly revision: number
}

/** ReviewRound lifecycle status. */
export type ReviewRoundStatus =
  | 'open'
  | 'changes_requested'
  | 'needs_research'
  | 'rejected'
  | 'approved'
  | 'invalidated'
  | 'archived'

/** ReviewDecision actions. */
export type ReviewDecisionAction =
  | 'select'
  | 'request_revision'
  | 'reject'
  | 'needs_research'
  | 'approve'
  | 'revoke_approval'

/** Host-owned review actor kinds. */
export type ReviewActorKind = 'local_human' | 'recorded_demo_human'

/** Audience profiles for deliverables. */
export type AudienceProfile = 'internal_review' | 'designer_handoff' | 'public_portfolio'

/** Source inclusion mode. */
export type SourceInclusion = 'embedded' | 'summarized' | 'link_only' | 'excluded'

/** Deliverable status. */
export type DeliverableStatus =
  | 'generating'
  | 'ready'
  | 'failed'
  | 'invalidated'
  | 'withdrawn'
  | 'archived'

/** Approval invalidation cause. */
export type ApprovalInvalidationCause =
  | 'upstream_stale'
  | 'brief_revision_changed'
  | 'concept_set_revision_changed'
  | 'concept_revision_changed'
  | 'visual_reference_withdrawn'
  | 'approval_revoked'
  | 'evidence_withdrawn'
  | 'artifact_integrity_failed'

/** SourceManifest entry. */
export interface SourceManifestEntry {
  readonly sourceRef: string
  readonly evidenceRef: string | null
  readonly title: string
  readonly locator: string | null
  readonly accessedAt: string | null
  readonly usageBoundary: string
  readonly audienceVisibility: string
  readonly inclusion: SourceInclusion
  readonly exclusionReason: string | null
  readonly artifactHash: string | null
}

/** ReviewRound projection. */
export interface ReviewRound extends DesignEnvelope {
  readonly id: ReviewRoundId
  readonly briefRef: ExactRef
  readonly conceptSetRef: ExactRef
  readonly conceptRefs: readonly [ExactRef, ExactRef, ExactRef]
  readonly visualDraftRefs: readonly ExactRef[]
  readonly comparisonSnapshotHash: string
  readonly openedBy: ReviewActorKind
  readonly openedAt: string
  readonly closedAt: string | null
  readonly status: ReviewRoundStatus
  readonly currentSelectionDecisionId: ReviewDecisionId | null
  readonly currentApprovalDecisionId: ReviewDecisionId | null
}

/** Append-only ReviewDecision projection. */
export interface ReviewDecision extends DesignEnvelope {
  readonly id: ReviewDecisionId
  readonly reviewRoundId: ReviewRoundId
  readonly subjectType: 'concept_set' | 'concept'
  readonly subjectRef: ExactRef
  readonly action: ReviewDecisionAction
  readonly selectedConceptRef: ExactRef | null
  readonly reasonCodes: readonly string[]
  readonly reasonText: string | null
  readonly advisoryConditions: readonly string[]
  readonly nextAction: string | null
  readonly actorId: string
  readonly actorKind: ReviewActorKind
  readonly frozenInputs: FrozenApprovalInputs | null
}

/** One exact ref frozen when an approval is recorded. */
export interface FrozenExactEntry {
  readonly targetType: 'brief' | 'concept_set' | 'concept' | 'visual_draft' | 'evidence'
  readonly ref: ExactRef
  readonly contentHash: string
}

/** Complete key-input set frozen on an approve decision. */
export interface FrozenApprovalInputs {
  readonly entries: readonly FrozenExactEntry[]
  readonly inputSetHash: string
}

/** Approval validity projection (not a durable write surface). */
export interface ApprovalValidity {
  readonly valid: boolean
  readonly reviewRoundId: ReviewRoundId
  readonly approvalDecisionId: ReviewDecisionId | null
  readonly invalidationIds: readonly ApprovalInvalidationId[]
  readonly causes: readonly ApprovalInvalidationCause[]
}

/** Append-only ApprovalInvalidation projection. */
export interface ApprovalInvalidation extends DesignEnvelope {
  readonly id: ApprovalInvalidationId
  readonly reviewRoundId: ReviewRoundId
  readonly approvalDecisionId: ReviewDecisionId | null
  readonly affectedRefs: readonly ExactRef[]
  readonly cause: ApprovalInvalidationCause
  readonly triggerRef: ExactRef | null
  readonly detectedBy: 'system' | 'local_human'
  readonly detectedAt: string
  readonly note: string | null
}

/** DesignDeliverable projection. */
export interface DesignDeliverable extends DesignEnvelope {
  readonly id: DesignDeliverableId
  readonly deliverableType: 'design_decision_package'
  readonly audienceProfile: AudienceProfile
  readonly reviewRoundId: ReviewRoundId
  readonly snapshotRef: ExactRef
  readonly snapshotHash: string
  readonly briefRef: ExactRef
  readonly conceptSetRef: ExactRef
  readonly selectedConceptRef: ExactRef
  readonly approvalDecisionRef: ExactRef
  readonly sourceManifestRef: ExactRef
  readonly artifactRefs: readonly ExactRef[]
  readonly knownRisks: readonly string[]
  readonly limitations: readonly string[]
  readonly handoffTarget: string | null
  readonly status: DeliverableStatus
  readonly frozenBy: ReviewActorKind | null
  readonly frozenAt: string | null
  readonly invalidatedAt: string | null
  readonly failureReason: string | null
  readonly rendererVersion: string
}

/** ExportArtifact projection. */
export interface ExportArtifactView extends DesignEnvelope {
  readonly id: ExportArtifactId
  readonly deliverableId: DesignDeliverableId
  readonly kind: 'json' | 'markdown' | 'manifest'
  readonly mediaType: string
  readonly filename: string
  readonly relativePath: string
  readonly byteLength: number
  readonly contentSha256: string
  readonly textContent: string
}

/** Deliverable preview (filter counts without generating). */
export interface DeliverablePreview {
  readonly audienceProfile: AudienceProfile
  readonly ruleVersion: string
  readonly included: number
  readonly summarized: number
  readonly linkOnly: number
  readonly excluded: number
  readonly entries: readonly SourceManifestEntry[]
  readonly limitations: readonly string[]
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'fashion-design/project-not-found': { readonly projectId: ProjectId }
    'fashion-design/brief-not-found': { readonly briefId: DesignBriefId }
    'fashion-design/concept-set-not-found': { readonly conceptSetId: ConceptSetId }
    'fashion-design/concept-not-found': { readonly conceptId: DesignConceptId }
    'fashion-design/visual-draft-not-found': { readonly visualDraftId: VisualDraftId }
    'fashion-design/project-read-only': { readonly projectId: ProjectId }
    'fashion-design/cross-project-reference': {
      readonly projectId: ProjectId
      readonly otherProjectId: ProjectId
    }
    'fashion-design/revision-conflict': { readonly expected: number; readonly actual: number }
    'fashion-design/invalid-input': { readonly reason: string }
    'fashion-design/invalid-transition': { readonly reason: string }
    'fashion-design/upstream-not-selected': { readonly opportunityId: DesignOpportunityId }
    'fashion-design/upstream-stale': { readonly opportunityId: DesignOpportunityId }
    'fashion-design/brief-not-confirmed': { readonly briefId: DesignBriefId }
    'fashion-design/concept-count-invalid': { readonly count: number }
    'fashion-design/differentiation-failed': { readonly reason: string }
    'fashion-design/seed-conflict': { readonly reason: string }
    'fashion-design/human-required': { readonly reason: string }
    'fashion-design/review-not-found': { readonly reviewRoundId: ReviewRoundId }
    'fashion-design/concept-set-not-ready': { readonly reason: string }
    'fashion-design/review-already-open': { readonly reviewRoundId: ReviewRoundId }
    'fashion-design/review-closed': { readonly reviewRoundId: ReviewRoundId }
    'fashion-design/concept-not-in-round': { readonly conceptId: DesignConceptId }
    'fashion-design/selection-required': { readonly reason: string }
    'fashion-design/blocking-condition': { readonly reason: string }
    'fashion-design/approval-invalid': { readonly reason: string }
    'fashion-design/deliverable-not-found': { readonly deliverableId: DesignDeliverableId }
    'fashion-design/canonicalization-failed': { readonly reason: string }
    'fashion-design/render-failed': { readonly reason: string }
    'fashion-design/integrity-mismatch': { readonly reason: string }
  }
}
