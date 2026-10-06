/**
 * Fashion Analysis registry (`ctx.fashionAnalysisRegistry`): durable
 * MarketItem / Ontology / Attribute / Signal / Cluster / Opportunity over Storage Domain `fashion_analysis@0`.
 * @module @gentlexx/dsh-fashion-analysis
 */

import {
  AnalysisRunId as brandAnalysisRunId,
  AttributeAssertionId as brandAttributeAssertionId,
  DesignOpportunityId as brandDesignOpportunityId,
  MarketItemId as brandMarketItemId,
  OntologyTermId as brandOntologyTermId,
  OntologyVersionId as brandOntologyVersionId,
  OpportunityDecisionId as brandOpportunityDecisionId,
  PopularitySignalId as brandPopularitySignalId,
  TrendClusterId as brandTrendClusterId,
} from './ids.ts'
import type {
  AnalysisRunId as AnalysisRunIdBrand,
  AttributeAssertionId as AttributeAssertionIdBrand,
  DesignOpportunityId as DesignOpportunityIdBrand,
  MarketItemId as MarketItemIdBrand,
  OntologyTermId as OntologyTermIdBrand,
  OntologyVersionId as OntologyVersionIdBrand,
  OpportunityDecisionId as OpportunityDecisionIdBrand,
  PopularitySignalId as PopularitySignalIdBrand,
  TrendClusterId as TrendClusterIdBrand,
} from './types.ts'

export type {
  ActorRef,
  AnalysisAccessMode,
  AnalysisEnvelope,
  AnalysisLineageRef,
  AnalysisObjectStatus,
  AnalysisOrigin,
  AnalysisRun,
  AnalysisRunStatus,
  AnalysisRunType,
  AssertionSource,
  AttributeReviewStatus,
  ClusterHumanReviewStatus,
  ClusterMemberRef,
  ClusterMethod,
  DesignOpportunity,
  DedupeStatus,
  EvidenceGrade,
  FashionAttributeAssertion,
  MarketItem,
  MarketItemType,
  MatchingMethod,
  ObservationLink,
  OntologyExternalMapping,
  OntologyTerm,
  OntologyTermStatus,
  OntologyVersion,
  OntologyVersionStatus,
  OpportunityDecision,
  OpportunityDecisionAction,
  OpportunityReasonCode,
  OpportunityReviewStatus,
  PopularitySignal,
  PopularitySignalType,
  QualityResult,
  QualityResultStatus,
  SignalStatus,
  SignalSubjectRef,
  TrendCluster,
} from './types.ts'
export { FASHION_ANALYSIS_SCHEMA_VERSION } from './types.ts'

/** Branded identities; factories below share these names. */
export type AnalysisRunId = AnalysisRunIdBrand
export type AttributeAssertionId = AttributeAssertionIdBrand
export type DesignOpportunityId = DesignOpportunityIdBrand
export type MarketItemId = MarketItemIdBrand
export type OntologyTermId = OntologyTermIdBrand
export type OntologyVersionId = OntologyVersionIdBrand
export type OpportunityDecisionId = OpportunityDecisionIdBrand
export type PopularitySignalId = PopularitySignalIdBrand
export type TrendClusterId = TrendClusterIdBrand

/** @param id - Raw id. @returns branded MarketItemId. */
export function MarketItemId(id: string): MarketItemId {
  return brandMarketItemId(id)
}
/** @param id - Raw id. @returns branded AttributeAssertionId. */
export function AttributeAssertionId(id: string): AttributeAssertionId {
  return brandAttributeAssertionId(id)
}
/** @param id - Raw id. @returns branded OntologyVersionId. */
export function OntologyVersionId(id: string): OntologyVersionId {
  return brandOntologyVersionId(id)
}
/** @param id - Raw id. @returns branded OntologyTermId. */
export function OntologyTermId(id: string): OntologyTermId {
  return brandOntologyTermId(id)
}
/** @param id - Raw id. @returns branded PopularitySignalId. */
export function PopularitySignalId(id: string): PopularitySignalId {
  return brandPopularitySignalId(id)
}
/** @param id - Raw id. @returns branded AnalysisRunId. */
export function AnalysisRunId(id: string): AnalysisRunId {
  return brandAnalysisRunId(id)
}
/** @param id - Raw id. @returns branded TrendClusterId. */
export function TrendClusterId(id: string): TrendClusterId {
  return brandTrendClusterId(id)
}
/** @param id - Raw id. @returns branded DesignOpportunityId. */
export function DesignOpportunityId(id: string): DesignOpportunityId {
  return brandDesignOpportunityId(id)
}
/** @param id - Raw id. @returns branded OpportunityDecisionId. */
export function OpportunityDecisionId(id: string): OpportunityDecisionId {
  return brandOpportunityDecisionId(id)
}

export {
  FashionAnalysisAssertionNotFoundError,
  FashionAnalysisClusterNotFoundError,
  FashionAnalysisCrossProjectReferenceError,
  FashionAnalysisCrossTaskReferenceError,
  FashionAnalysisEvidenceNotEligibleError,
  FashionAnalysisIdCollisionError,
  FashionAnalysisInvalidInputError,
  FashionAnalysisInvalidTransitionError,
  FashionAnalysisItemNotFoundError,
  FashionAnalysisOntologyNotFoundError,
  FashionAnalysisOpportunityNotFoundError,
  FashionAnalysisProjectNotFoundError,
  FashionAnalysisProjectReadOnlyError,
  FashionAnalysisRevisionConflictError,
  FashionAnalysisSeedConflictError,
  FashionAnalysisSignalNotFoundError,
  FashionAnalysisTaskNotFoundError,
} from './errors.ts'

export { compareAnalysisUpdatedDesc } from './order.ts'
export type { AnalysisListOrderable } from './order.ts'

export {
  fashionAnalysisDomainSpec,
  FASHION_ANALYSIS_DOMAIN_VERSION,
} from './spec.ts'
export type {
  AnalysisRunRecordV0,
  AttributeAssertionRecordV0,
  DesignOpportunityRecordV0,
  MarketItemRecordV0,
  OntologyTermRecordV0,
  OntologyVersionRecordV0,
  OpportunityDecisionRecordV0,
  PopularitySignalRecordV0,
  TrendClusterRecordV0,
} from './spec.ts'

export {
  isValidR0AnalysisSeed,
  R0_ANALYSIS_RUN_SEEDS,
  R0_ASSERTION_SEEDS,
  R0_CLUSTER_ID,
  R0_CLUSTER_SEED,
  R0_DECISION_ID,
  R0_DECISION_SEED,
  R0_MARKET_ITEM_SEEDS,
  R0_ONTOLOGY_TERM_SEEDS,
  R0_ONTOLOGY_VERSION_ID,
  R0_ONTOLOGY_VERSION_RECORD,
  R0_OPPORTUNITY_ID,
  R0_OPPORTUNITY_SEED,
  R0_SIGNAL_SEEDS,
} from './seed/r0-analysis.ts'

export { FashionAnalysisRegistry } from './registry.ts'
export { FashionAnalysisRegistry as default } from './registry.ts'
