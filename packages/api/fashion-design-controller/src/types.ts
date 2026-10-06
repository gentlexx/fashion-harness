/**
 * Wire types for the Fashion Design Remote namespace.
 * @module @gentlexx/dsh-api-fashion-design-controller/src/types
 */

import type {
  DesignOpportunityId,
  OpportunityDecisionId,
} from '@gentlexx/dsh-fashion-analysis/types'
import type {
  ConceptSet,
  ConceptSetId,
  ConstraintEntry,
  DesignBriefId,
  DesignConcept,
  DesignConceptId,
  DesignDeliverable,
  DesignDeliverableId,
  DesignOpportunityBrief,
  DifferentiationCheck,
  DeliverablePreview,
  ApprovalValidity,
  AudienceProfile,
  ExportArtifactView,
  PriceTarget,
  ReadinessCheck,
  ReviewDecision,
  ReviewRound,
  ReviewRoundId,
  VisualDraft,
  VisualDraftId,
} from '@gentlexx/dsh-fashion-design/types'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'

export type {
  ConceptSet,
  ConceptSetId,
  DesignBriefId,
  DesignConcept,
  DesignConceptId,
  DesignOpportunityBrief,
  DifferentiationCheck,
  ProjectId,
  ReadinessCheck,
  VisualDraft,
  VisualDraftId,
}

/** Project-scoped design workspace request. */
export interface DesignScopeRequest {
  readonly projectId: ProjectId
}

/** Complete design workspace snapshot for one Project. */
export interface DesignWorkspaceValue {
  readonly briefs: readonly DesignOpportunityBrief[]
  readonly conceptSets: readonly ConceptSet[]
  readonly concepts: readonly DesignConcept[]
}

/** Create Brief from selected Opportunity. */
export interface CreateBriefFromOpportunityRequest extends DesignScopeRequest {
  readonly opportunityId: DesignOpportunityId
  readonly expectedOpportunityRevision: number
  readonly selectionDecisionId: OpportunityDecisionId
  readonly market: string
  readonly season: string
  readonly category: string
  readonly targetUser: string
  readonly brandContext?: string | null
  readonly priceTarget?: PriceTarget | null
  readonly mustKeep?: readonly ConstraintEntry[]
  readonly mustAvoid?: readonly ConstraintEntry[]
  readonly materialsConstraints?: readonly ConstraintEntry[]
  readonly costConstraints?: readonly ConstraintEntry[]
  readonly productionConstraints?: readonly ConstraintEntry[]
  readonly differentiationGoals?: readonly ConstraintEntry[]
  readonly openQuestions?: readonly ConstraintEntry[]
  readonly constraintSources?: readonly string[]
}

/** Get Brief. */
export interface GetBriefRequest extends DesignScopeRequest {
  readonly briefId: DesignBriefId
}

/** Confirm Brief. */
export interface ConfirmBriefRequest extends DesignScopeRequest {
  readonly briefId: DesignBriefId
  readonly expectedRevision: number
}

/** Create ConceptSet. */
export interface CreateConceptSetRequest extends DesignScopeRequest {
  readonly briefId: DesignBriefId
  readonly expectedBriefRevision: number
}

/** Get ConceptSet. */
export interface GetConceptSetRequest extends DesignScopeRequest {
  readonly conceptSetId: ConceptSetId
}

/** Mark ConceptSet review_ready. */
export interface MarkConceptSetReviewReadyRequest extends DesignScopeRequest {
  readonly conceptSetId: ConceptSetId
  readonly expectedRevision: number
}

/** Create Concept. */
export interface CreateConceptRequest extends DesignScopeRequest {
  readonly conceptSetId: ConceptSetId
  readonly expectedConceptSetRevision: number
  readonly conceptName: string
  readonly designIntent: string
  readonly silhouette: string
  readonly proportionAndLength: string
  readonly materialDirection: string
  readonly colorDirection: string
  readonly constructionAndDetails: readonly string[]
  readonly functionalValue: readonly string[]
  readonly targetUseScenarios: readonly string[]
  readonly marketEvidenceLinks?: DesignConcept['marketEvidenceLinks']
  readonly originalTransformationNotes?: readonly string[]
  readonly competitorSimilarityRisks?: DesignConcept['competitorSimilarityRisks']
  readonly productionUnknowns?: readonly string[]
  readonly constraintCoverage?: DesignConcept['constraintCoverage']
}

/** Revise one Concept at its exact revision; omitted fields keep their recorded values. */
export interface ReviseConceptRequest extends DesignScopeRequest {
  readonly conceptId: DesignConceptId
  readonly expectedRevision: number
  readonly conceptName?: string
  readonly designIntent?: string
  readonly silhouette?: string
  readonly proportionAndLength?: string
  readonly materialDirection?: string
  readonly colorDirection?: string
  readonly constructionAndDetails?: readonly string[]
  readonly functionalValue?: readonly string[]
  readonly targetUseScenarios?: readonly string[]
  readonly originalTransformationNotes?: readonly string[]
  readonly productionUnknowns?: readonly string[]
}

/** Get Concept. */
export interface GetConceptRequest extends DesignScopeRequest {
  readonly conceptId: DesignConceptId
}

/** Evaluate differentiation. */
export interface EvaluateDifferentiationRequest extends DesignScopeRequest {
  readonly conceptSetId: ConceptSetId
}

/** Evaluate readiness. */
export interface EvaluateReadinessRequest extends DesignScopeRequest {
  readonly conceptSetId: ConceptSetId
}

/** Get VisualDraft. */
export interface GetVisualDraftRequest extends DesignScopeRequest {
  readonly visualDraftId: VisualDraftId
}

/** List VisualDrafts for a Concept. */
export interface ListVisualDraftsRequest extends DesignScopeRequest {
  readonly conceptId: DesignConceptId
}

/** Open ReviewRound. */
export interface OpenReviewRequest extends DesignScopeRequest {
  readonly conceptSetId: ConceptSetId
  readonly expectedConceptSetRevision: number
  readonly idempotencyKey?: string | null
}

/** Get / list ReviewRound. */
export interface GetReviewRequest extends DesignScopeRequest {
  readonly reviewRoundId: ReviewRoundId
}

/** Select Concept in a ReviewRound. */
export interface SelectConceptRequest extends DesignScopeRequest {
  readonly reviewRoundId: ReviewRoundId
  readonly conceptId: DesignConceptId
  readonly expectedConceptRevision: number
  readonly reasonCodes: readonly string[]
  readonly reasonText?: string | null
}

/** Approve selected Concept. */
export interface ApproveSelectedConceptRequest extends DesignScopeRequest {
  readonly reviewRoundId: ReviewRoundId
  readonly reasonCodes: readonly string[]
  readonly reasonText?: string | null
}

/** Close-round decisions: revision / reject / needs research. */
export interface CloseReviewDecisionRequest extends DesignScopeRequest {
  readonly reviewRoundId: ReviewRoundId
  readonly subjectType: 'concept_set' | 'concept'
  readonly subjectId: string
  readonly expectedRevision: number
  readonly reasonCodes: readonly string[]
  readonly reasonText: string
}

/** Revoke a currently valid approval. */
export interface RevokeApprovalRequest extends DesignScopeRequest {
  readonly reviewRoundId: ReviewRoundId
  readonly reasonText: string
  readonly reasonCodes?: readonly string[]
}

/** Preview / generate deliverable. */
export interface GenerateDeliverableRequest extends DesignScopeRequest {
  readonly reviewRoundId: ReviewRoundId
  readonly audienceProfile: AudienceProfile
  readonly idempotencyKey?: string | null
}

/** Get Deliverable. */
export interface GetDeliverableRequest extends DesignScopeRequest {
  readonly deliverableId: DesignDeliverableId
}

export type BriefValue = DesignOpportunityBrief
export type ConceptSetValue = ConceptSet
export type ConceptValue = DesignConcept
export type VisualDraftValue = VisualDraft
export type ReviewRoundValue = ReviewRound
export type ReviewDecisionValue = ReviewDecision
export type DesignDeliverableValue = DesignDeliverable
export type DeliverablePreviewValue = DeliverablePreview
export type ExportArtifactValue = ExportArtifactView
export type ApprovalValidityValue = ApprovalValidity
