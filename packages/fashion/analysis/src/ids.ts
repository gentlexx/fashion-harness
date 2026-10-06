/**
 * Brand factories for Fashion Analysis identities.
 * @module @gentlexx/dsh-fashion-analysis/src/ids
 */

import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  AnalysisRunId,
  AttributeAssertionId,
  DesignOpportunityId,
  MarketItemId,
  OntologyTermId,
  OntologyVersionId,
  OpportunityDecisionId,
  PopularitySignalId,
  TrendClusterId,
} from './types.ts'

/** @param id - Raw market item id. @returns branded MarketItemId. */
export function MarketItemId(id: string): MarketItemId {
  return brandString<MarketItemId>(id)
}

/** @param id - Raw assertion id. @returns branded AttributeAssertionId. */
export function AttributeAssertionId(id: string): AttributeAssertionId {
  return brandString<AttributeAssertionId>(id)
}

/** @param id - Raw ontology version id. @returns branded OntologyVersionId. */
export function OntologyVersionId(id: string): OntologyVersionId {
  return brandString<OntologyVersionId>(id)
}

/** @param id - Raw ontology term id. @returns branded OntologyTermId. */
export function OntologyTermId(id: string): OntologyTermId {
  return brandString<OntologyTermId>(id)
}

/** @param id - Raw signal id. @returns branded PopularitySignalId. */
export function PopularitySignalId(id: string): PopularitySignalId {
  return brandString<PopularitySignalId>(id)
}

/** @param id - Raw analysis run id. @returns branded AnalysisRunId. */
export function AnalysisRunId(id: string): AnalysisRunId {
  return brandString<AnalysisRunId>(id)
}

/** @param id - Raw cluster id. @returns branded TrendClusterId. */
export function TrendClusterId(id: string): TrendClusterId {
  return brandString<TrendClusterId>(id)
}

/** @param id - Raw opportunity id. @returns branded DesignOpportunityId. */
export function DesignOpportunityId(id: string): DesignOpportunityId {
  return brandString<DesignOpportunityId>(id)
}

/** @param id - Raw decision id. @returns branded OpportunityDecisionId. */
export function OpportunityDecisionId(id: string): OpportunityDecisionId {
  return brandString<OpportunityDecisionId>(id)
}
