/**
 * Wire types for the Fashion Analysis Remote namespace.
 * @module @gentlexx/dsh-api-fashion-analysis-controller/src/types
 */

import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import type { EvidenceId, ResearchTaskId, SampleId, SourceId } from '@gentlexx/dsh-fashion-research/types'
import type {
  AnalysisRun,
  ClusterMethod,
  DesignOpportunity,
  DesignOpportunityId,
  DedupeStatus,
  EvidenceGrade,
  FashionAttributeAssertion,
  MarketItem,
  MarketItemId,
  MarketItemType,
  MatchingMethod,
  ObservationLink,
  OntologyTerm,
  OntologyVersion,
  OpportunityDecision,
  OpportunityDecisionAction,
  OpportunityReasonCode,
  PopularitySignal,
  PopularitySignalId,
  PopularitySignalType,
  TrendCluster,
  TrendClusterId,
} from '@gentlexx/dsh-fashion-analysis/types'

export type {
  AnalysisRun,
  DesignOpportunity,
  DesignOpportunityId,
  FashionAttributeAssertion,
  MarketItem,
  MarketItemId,
  OntologyTerm,
  OntologyVersion,
  OpportunityDecision,
  PopularitySignal,
  PopularitySignalId,
  ProjectId,
  ResearchTaskId,
  TrendCluster,
  TrendClusterId,
}

/** Parent-scoped analysis workspace request. */
export interface AnalysisScopeRequest {
  readonly projectId: ProjectId
  readonly taskId: ResearchTaskId
}

/** Complete analysis workspace snapshot for one ResearchTask. */
export interface AnalysisWorkspaceValue {
  readonly marketItems: readonly MarketItem[]
  readonly ontologyVersions: readonly OntologyVersion[]
  readonly ontologyTerms: readonly OntologyTerm[]
  readonly assertions: readonly FashionAttributeAssertion[]
  readonly signals: readonly PopularitySignal[]
  readonly runs: readonly AnalysisRun[]
  readonly clusters: readonly TrendCluster[]
  readonly opportunities: readonly DesignOpportunity[]
  readonly decisions: readonly OpportunityDecision[]
  readonly staleMarked: number
}

/** Create MarketItem request. */
export interface CreateMarketItemRequest extends AnalysisScopeRequest {
  readonly itemType: MarketItemType
  readonly displayName: string
  readonly brandOrCreator?: string | null
  readonly categoryCandidate?: string | null
  readonly observationLinks: readonly {
    readonly sampleId: SampleId
    readonly sourceId: SourceId
    readonly evidenceIds: readonly EvidenceId[]
  }[]
  readonly matchingMethod?: MatchingMethod
}

/** Confirm dedupe request (human only). */
export interface ConfirmDedupeRequest extends AnalysisScopeRequest {
  readonly marketItemId: MarketItemId
  readonly expectedRevision: number
  readonly dedupeStatus: Extract<DedupeStatus, 'confirmed_same' | 'confirmed_distinct'>
}

/** Get MarketItem request. */
export interface GetMarketItemRequest extends AnalysisScopeRequest {
  readonly marketItemId: MarketItemId
}

/** Create PopularitySignal request. */
export interface CreatePopularitySignalRequest extends AnalysisScopeRequest {
  readonly signalType: PopularitySignalType
  readonly subjectRefs: PopularitySignal['subjectRefs']
  readonly platform: string
  readonly marketRegion?: string | null
  readonly windowStart?: string | null
  readonly windowEnd?: string | null
  readonly observedAt: string
  readonly rawValue: string
  readonly rawUnit: string
  readonly evidenceIds: readonly EvidenceId[]
  readonly methodVersion: string
  readonly limitations: readonly string[]
}

/** Get PopularitySignal request. */
export interface GetSignalRequest extends AnalysisScopeRequest {
  readonly signalId: PopularitySignalId
}

/** Create TrendCluster request. */
export interface CreateTrendClusterRequest extends AnalysisScopeRequest {
  readonly name: string
  readonly definition: string
  readonly memberRefs: TrendCluster['memberRefs']
  readonly sharedAttributeAssertionIds?: readonly string[]
  readonly signalIds?: readonly PopularitySignalId[]
  readonly clusterMethod: ClusterMethod
  readonly methodVersion: string
  readonly marketRegions: readonly string[]
  readonly timeContext: string
  readonly evidenceGrade: EvidenceGrade
  readonly counterEvidence: readonly string[]
  readonly biasesAndGaps: readonly string[]
  readonly lifecycleHypothesis?: string | null
}

/** Get TrendCluster request. */
export interface GetClusterRequest extends AnalysisScopeRequest {
  readonly clusterId: TrendClusterId
}

/** Create DesignOpportunity request. */
export interface CreateDesignOpportunityRequest extends AnalysisScopeRequest {
  readonly title: string
  readonly opportunityStatement: string
  readonly trendClusterIds: readonly TrendClusterId[]
  readonly targetMarket: string
  readonly targetUserHypothesis: string
  readonly category: string
  readonly timing: string
  readonly commercialHypotheses?: readonly string[]
  readonly creativeSpaces?: readonly string[]
  readonly saturationRisks?: readonly string[]
  readonly copyingOrIpRisks?: readonly string[]
  readonly unknowns?: readonly string[]
  readonly evidenceGrade: EvidenceGrade
}

/** Decide DesignOpportunity request (human only). */
export interface DecideOpportunityRequest extends AnalysisScopeRequest {
  readonly opportunityId: DesignOpportunityId
  readonly expectedRevision: number
  readonly action: OpportunityDecisionAction
  readonly reasonCodes: readonly OpportunityReasonCode[]
  readonly note: string
}

/** Get DesignOpportunity request. */
export interface GetOpportunityRequest extends AnalysisScopeRequest {
  readonly opportunityId: DesignOpportunityId
}

/** DecideOpportunity response. */
export interface DecideOpportunityValue {
  readonly opportunity: DesignOpportunity
  readonly decision: OpportunityDecision
}

/** Wire aliases. */
export type MarketItemValue = MarketItem
export type SignalValue = PopularitySignal
export type ClusterValue = TrendCluster
export type OpportunityValue = DesignOpportunity

/** Unused ObservationLink re-export for Client forms. */
export type { ObservationLink }
