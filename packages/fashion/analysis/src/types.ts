/**
 * Public type vocabulary of the Fashion Analysis domain.
 * Types only — factories and errors live in runtime modules.
 * @module @gentlexx/dsh-fashion-analysis/src/types
 */

import type { Branded } from '@deepseek-ai/dsh-brand'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type {
  EvidenceId,
  ResearchTaskId,
  SampleId,
  SourceId,
} from '@gentlexx/dsh-fashion-research/types'
import type {} from '@deepseek-ai/dsh-typert-protocol'

/** Stable MarketItem identity; never a SampleId or SessionId. */
export type MarketItemId = Branded<'FashionMarketItemId'>

/** Stable AttributeAssertion identity. */
export type AttributeAssertionId = Branded<'FashionAttributeAssertionId'>

/** Stable OntologyVersion identity. */
export type OntologyVersionId = Branded<'FashionOntologyVersionId'>

/** Stable OntologyTerm identity. */
export type OntologyTermId = Branded<'FashionOntologyTermId'>

/** Stable PopularitySignal identity. */
export type PopularitySignalId = Branded<'FashionPopularitySignalId'>

/** Stable AnalysisRun identity. */
export type AnalysisRunId = Branded<'FashionAnalysisRunId'>

/** Stable TrendCluster identity. */
export type TrendClusterId = Branded<'FashionTrendClusterId'>

/** Stable DesignOpportunity identity. */
export type DesignOpportunityId = Branded<'FashionDesignOpportunityId'>

/** Stable OpportunityDecision identity. */
export type OpportunityDecisionId = Branded<'FashionOpportunityDecisionId'>

/**
 * Actor that created or mutated an analysis object.
 * Without accounts, Host uses local-human, system-rule, or system-seed only.
 */
export type ActorRef = 'local-human' | 'system-rule' | 'system-seed'

/** How an analysis object entered durable storage. */
export type AnalysisOrigin = 'human' | 'rule' | 'import' | 'system_seed'

/** Whether an analysis object may be mutated by ordinary Host writes. */
export type AnalysisAccessMode = 'editable' | 'read-only'

/** Retention / validity status shared by most analysis rows. */
export type AnalysisObjectStatus = 'active' | 'stale' | 'invalidated' | 'archived'

/** MarketItem kind admitted in v0. */
export type MarketItemType = 'garment_product' | 'content_post' | 'trend_topic'

/** Dedupe workflow; rules may only reach candidate_match. */
export type DedupeStatus =
  | 'unreviewed'
  | 'candidate_match'
  | 'confirmed_same'
  | 'confirmed_distinct'

/** Matching method admitted in v0 (no embedding). */
export type MatchingMethod = 'manual' | 'exact_external_id' | 'rule'

/** OntologyVersion lifecycle. */
export type OntologyVersionStatus = 'draft' | 'published' | 'superseded' | 'archived'

/** OntologyTerm retention. */
export type OntologyTermStatus = 'active' | 'deprecated' | 'archived'

/** Attribute assertion review workflow. */
export type AttributeReviewStatus =
  | 'unreviewed'
  | 'accepted'
  | 'corrected'
  | 'rejected'
  | 'unknown'

/** Where an attribute assertion came from. */
export type AssertionSource = 'page_text' | 'human' | 'rule'

/** PopularitySignal type admitted in v0. */
export type PopularitySignalType =
  | 'search_growth'
  | 'rank_position'
  | 'view_count'
  | 'engagement'
  | 'save_rate'
  | 'sellout_claim'
  | 'cross_source_presence'

/** Signal production status. */
export type SignalStatus = 'draft' | 'observed' | 'computed' | 'invalidated' | 'stale'

/** AnalysisRun job kind. */
export type AnalysisRunType =
  | 'normalize'
  | 'quality_check'
  | 'derive_signal'
  | 'build_cluster'
  | 'build_opportunity'

/** AnalysisRun lifecycle. */
export type AnalysisRunStatus = 'started' | 'completed' | 'failed' | 'aborted'

/** One quality rule outcome embedded in an AnalysisRun. */
export type QualityResultStatus = 'pass' | 'fail' | 'warning' | 'not_applicable'

/** Cluster construction method admitted in v0. */
export type ClusterMethod = 'manual' | 'rule'

/** Human review of a TrendCluster. */
export type ClusterHumanReviewStatus =
  | 'draft'
  | 'accepted'
  | 'rejected'
  | 'needs_more_research'

/** Opportunity review status; system may only mint candidate. */
export type OpportunityReviewStatus =
  | 'candidate'
  | 'selected'
  | 'rejected'
  | 'needs_more_research'

/** Human opportunity decision action. */
export type OpportunityDecisionAction = 'selected' | 'rejected' | 'needs_more_research'

/** Minimal engineering reason codes until R1 calibrates display vocabulary. */
export type OpportunityReasonCode =
  | 'evidence_sufficient'
  | 'evidence_weak'
  | 'brand_fit_unknown'
  | 'saturated'
  | 'copying_risk'
  | 'needs_designer_validation'
  | 'other'
  | 'public_rebuild_recorded'

/** Evidence grade echoed on clusters/opportunities. */
export type EvidenceGrade = 'G0' | 'G1' | 'G2' | 'G3' | 'G4'

/** Current schema generation stamped on every durable analysis row. */
export const FASHION_ANALYSIS_SCHEMA_VERSION = 0

/** Shared durable envelope fields present on every analysis object. */
export interface AnalysisEnvelope {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly origin: AnalysisOrigin
  readonly accessMode: AnalysisAccessMode
  readonly status: AnalysisObjectStatus
  readonly revision: number
  readonly createdAt: string
  readonly updatedAt: string
  readonly createdBy: ActorRef
  readonly updatedBy: ActorRef
  readonly schemaVersion: typeof FASHION_ANALYSIS_SCHEMA_VERSION
  readonly archivedAt: string | null
  readonly staleReason: string | null
}

/** One Sample/Source observation link on a MarketItem. */
export interface ObservationLink {
  readonly sampleId: SampleId
  readonly sourceId: SourceId
  readonly evidenceIds: readonly EvidenceId[]
}

/** Authoritative MarketItem projection. */
export interface MarketItem extends AnalysisEnvelope {
  readonly id: MarketItemId
  readonly itemType: MarketItemType
  readonly displayName: string
  readonly brandOrCreator: string | null
  readonly categoryCandidate: string | null
  readonly observationLinks: readonly ObservationLink[]
  readonly dedupeStatus: DedupeStatus
  readonly matchingMethod: MatchingMethod
  readonly matchingScore: number | null
  readonly humanConfirmedBy: ActorRef | null
  readonly humanConfirmedAt: string | null
}

/** External mapping row on an OntologyTerm. */
export interface OntologyExternalMapping {
  readonly system: string
  readonly code: string
  readonly label: string | null
}

/** Authoritative OntologyVersion projection. */
export interface OntologyVersion extends AnalysisEnvelope {
  readonly id: OntologyVersionId
  readonly versionLabel: string
  readonly ontologyStatus: OntologyVersionStatus
  readonly scopeNote: string
  readonly publishedAt: string | null
}

/** Authoritative OntologyTerm projection. */
export interface OntologyTerm extends AnalysisEnvelope {
  readonly id: OntologyTermId
  readonly ontologyVersionId: OntologyVersionId
  readonly domain: string
  readonly canonicalLabel: string
  readonly aliases: readonly string[]
  readonly parentTermId: OntologyTermId | null
  readonly externalMappings: readonly OntologyExternalMapping[]
  readonly definition: string
  readonly termStatus: OntologyTermStatus
}

/** Authoritative FashionAttributeAssertion projection. */
export interface FashionAttributeAssertion extends AnalysisEnvelope {
  readonly id: AttributeAssertionId
  readonly subjectType: 'market_item'
  readonly subjectId: MarketItemId
  readonly attributePath: string
  readonly rawValue: string
  readonly normalizedTermId: OntologyTermId | null
  readonly ontologyVersionId: OntologyVersionId
  readonly assertionSource: AssertionSource
  readonly evidenceIds: readonly EvidenceId[]
  readonly confidence: number | null
  readonly reviewStatus: AttributeReviewStatus
  readonly reviewedBy: ActorRef | null
  readonly reviewedAt: string | null
  readonly correctionReason: string | null
  readonly supersedesAssertionId: AttributeAssertionId | null
}

/** Subject reference for a PopularitySignal. */
export interface SignalSubjectRef {
  readonly type: 'market_item' | 'sample' | 'source' | 'evidence' | 'cluster'
  readonly id: string
}

/** Authoritative PopularitySignal projection. */
export interface PopularitySignal extends AnalysisEnvelope {
  readonly id: PopularitySignalId
  readonly signalType: PopularitySignalType
  readonly subjectRefs: readonly SignalSubjectRef[]
  readonly platform: string
  readonly marketRegion: string | null
  readonly windowStart: string | null
  readonly windowEnd: string | null
  readonly observedAt: string
  readonly rawValue: string
  readonly rawUnit: string
  readonly normalizedValue: string | null
  readonly normalizationMethod: string | null
  readonly baseline: string | null
  readonly sampleSize: string | null
  readonly evidenceIds: readonly EvidenceId[]
  readonly methodVersion: string
  readonly limitations: readonly string[]
  readonly signalStatus: SignalStatus
}

/** Typed lineage ref for AnalysisRun inputs/outputs. */
export interface AnalysisLineageRef {
  readonly type: string
  readonly id: string
  readonly revision: number
}

/** One quality rule outcome. */
export interface QualityResult {
  readonly ruleId: string
  readonly ruleVersion: string
  readonly targetRef: AnalysisLineageRef
  readonly status: QualityResultStatus
  readonly message: string
  readonly evidenceRefs: readonly AnalysisLineageRef[]
}

/** Authoritative AnalysisRun projection. */
export interface AnalysisRun extends AnalysisEnvelope {
  readonly id: AnalysisRunId
  readonly runType: AnalysisRunType
  readonly methodName: string
  readonly methodVersion: string
  readonly inputRefs: readonly AnalysisLineageRef[]
  readonly outputRefs: readonly AnalysisLineageRef[]
  readonly ontologyVersionId: OntologyVersionId | null
  readonly ruleSetVersion: string | null
  readonly runStatus: AnalysisRunStatus
  readonly startedAt: string
  readonly finishedAt: string | null
  readonly errorCode: string | null
  readonly errorSummary: string | null
  readonly qualityResults: readonly QualityResult[]
  readonly idempotencyKey: string | null
}

/** Cluster member reference. */
export interface ClusterMemberRef {
  readonly type: 'market_item' | 'signal'
  readonly id: string
}

/** Authoritative TrendCluster projection. */
export interface TrendCluster extends AnalysisEnvelope {
  readonly id: TrendClusterId
  readonly name: string
  readonly definition: string
  readonly memberRefs: readonly ClusterMemberRef[]
  readonly sharedAttributeAssertionIds: readonly AttributeAssertionId[]
  readonly signalIds: readonly PopularitySignalId[]
  readonly clusterMethod: ClusterMethod
  readonly methodVersion: string
  readonly marketRegions: readonly string[]
  readonly timeContext: string
  readonly evidenceGrade: EvidenceGrade
  readonly counterEvidence: readonly string[]
  readonly biasesAndGaps: readonly string[]
  readonly lifecycleHypothesis: string | null
  readonly humanReviewStatus: ClusterHumanReviewStatus
  readonly analysisRunId: AnalysisRunId | null
}

/** Authoritative DesignOpportunity projection. */
export interface DesignOpportunity extends AnalysisEnvelope {
  readonly id: DesignOpportunityId
  readonly title: string
  readonly opportunityStatement: string
  readonly trendClusterIds: readonly TrendClusterId[]
  readonly targetMarket: string
  readonly targetUserHypothesis: string
  readonly category: string
  readonly timing: string
  readonly commercialHypotheses: readonly string[]
  readonly creativeSpaces: readonly string[]
  readonly saturationRisks: readonly string[]
  readonly copyingOrIpRisks: readonly string[]
  readonly unknowns: readonly string[]
  readonly evidenceGrade: EvidenceGrade
  readonly reviewStatus: OpportunityReviewStatus
  readonly analysisRunId: AnalysisRunId | null
  readonly currentDecisionId: OpportunityDecisionId | null
  readonly publicRebuildRecorded: boolean
}

/** Authoritative OpportunityDecision projection (immutable append). */
export interface OpportunityDecision {
  readonly id: OpportunityDecisionId
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
  readonly opportunityId: DesignOpportunityId
  readonly opportunityRevision: number
  readonly action: OpportunityDecisionAction
  readonly reasonCodes: readonly OpportunityReasonCode[]
  readonly note: string
  readonly actor: 'local-human'
  readonly createdAt: string
  readonly schemaVersion: typeof FASHION_ANALYSIS_SCHEMA_VERSION
  readonly publicRebuildRecorded: boolean
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'fashion-analysis/project-not-found': { readonly projectId: ProjectId }
    'fashion-analysis/task-not-found': { readonly taskId: ResearchTaskId }
    'fashion-analysis/item-not-found': { readonly marketItemId: MarketItemId }
    'fashion-analysis/signal-not-found': { readonly signalId: PopularitySignalId }
    'fashion-analysis/cluster-not-found': { readonly clusterId: TrendClusterId }
    'fashion-analysis/opportunity-not-found': { readonly opportunityId: DesignOpportunityId }
    'fashion-analysis/assertion-not-found': { readonly assertionId: AttributeAssertionId }
    'fashion-analysis/ontology-not-found': { readonly ontologyVersionId: OntologyVersionId }
    'fashion-analysis/project-read-only': { readonly projectId: ProjectId }
    'fashion-analysis/cross-project-reference': {
      readonly projectId: ProjectId
      readonly otherProjectId: ProjectId
    }
    'fashion-analysis/cross-task-reference': {
      readonly taskId: ResearchTaskId
      readonly otherTaskId: ResearchTaskId
    }
    'fashion-analysis/revision-conflict': { readonly expected: number; readonly actual: number }
    'fashion-analysis/invalid-input': { readonly reason: string }
    'fashion-analysis/invalid-transition': { readonly reason: string }
    'fashion-analysis/seed-conflict': { readonly reason: string }
    'fashion-analysis/evidence-not-eligible': { readonly evidenceId: EvidenceId }
  }
}
