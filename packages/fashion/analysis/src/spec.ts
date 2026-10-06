/**
 * Fashion Analysis domain declaration opened by the registry.
 * @module @gentlexx/dsh-fashion-analysis/src/spec
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
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
import {
  analysisRunRecordV0,
  attributeAssertionRecordV0,
  designOpportunityRecordV0,
  marketItemRecordV0,
  ontologyTermRecordV0,
  ontologyVersionRecordV0,
  opportunityDecisionRecordV0,
  popularitySignalRecordV0,
  trendClusterRecordV0,
  type AnalysisRunRecordV0,
  type AttributeAssertionRecordV0,
  type DesignOpportunityRecordV0,
  type MarketItemRecordV0,
  type OntologyTermRecordV0,
  type OntologyVersionRecordV0,
  type OpportunityDecisionRecordV0,
  type PopularitySignalRecordV0,
  type TrendClusterRecordV0,
} from './schema/v0/records.ts'

/** Current Storage Domain version for fashion_analysis. */
export const FASHION_ANALYSIS_DOMAIN_VERSION = 0

/**
 * Domain `fashion_analysis@0`: authoritative single-file tables for analysis objects.
 * Invalid records reject open; no compatibleVersions in v0.
 */
export const fashionAnalysisDomainSpec = defineDomain({
  name: 'fashion_analysis',
  version: FASHION_ANALYSIS_DOMAIN_VERSION,
  tables: {
    market_items: domainTable<MarketItemId, MarketItemRecordV0>(marketItemRecordV0),
    ontology_versions: domainTable<OntologyVersionId, OntologyVersionRecordV0>(ontologyVersionRecordV0),
    ontology_terms: domainTable<OntologyTermId, OntologyTermRecordV0>(ontologyTermRecordV0),
    attribute_assertions: domainTable<AttributeAssertionId, AttributeAssertionRecordV0>(attributeAssertionRecordV0),
    popularity_signals: domainTable<PopularitySignalId, PopularitySignalRecordV0>(popularitySignalRecordV0),
    analysis_runs: domainTable<AnalysisRunId, AnalysisRunRecordV0>(analysisRunRecordV0),
    trend_clusters: domainTable<TrendClusterId, TrendClusterRecordV0>(trendClusterRecordV0),
    design_opportunities: domainTable<DesignOpportunityId, DesignOpportunityRecordV0>(designOpportunityRecordV0),
    opportunity_decisions: domainTable<OpportunityDecisionId, OpportunityDecisionRecordV0>(opportunityDecisionRecordV0),
  },
})

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
}
