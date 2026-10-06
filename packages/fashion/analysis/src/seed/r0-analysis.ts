/**
 * R0 public-rebuild analysis seed for the Utility Jacket case (F2-02).
 * Fixed identities; system_seed + read-only; no live scrape or designer adoption claim.
 * @module @gentlexx/dsh-fashion-analysis/src/seed/r0-analysis
 */

import { R0_PROJECT_ID } from '@gentlexx/dsh-fashion-project'
import type { ProjectId } from '@gentlexx/dsh-fashion-project/types'
import { R0_TASK_ID, R0_RESEARCH_ACCESSED_AT } from '@gentlexx/dsh-fashion-research'
import {
  AnalysisRunId,
  AttributeAssertionId,
  DesignOpportunityId,
  MarketItemId,
  OntologyTermId,
  OntologyVersionId,
  OpportunityDecisionId,
  PopularitySignalId,
  TrendClusterId,
} from '../ids.ts'
import type {
  AnalysisRunRecordV0,
  AttributeAssertionRecordV0,
  DesignOpportunityRecordV0,
  MarketItemRecordV0,
  OntologyTermRecordV0,
  OntologyVersionRecordV0,
  OpportunityDecisionRecordV0,
  PopularitySignalRecordV0,
  TrendClusterRecordV0,
} from '../schema/v0/records.ts'
import { FASHION_ANALYSIS_SCHEMA_VERSION } from '../types.ts'

/** Reserved OntologyVersion id for R0 Utility Jacket lite vocabulary. */
export const R0_ONTOLOGY_VERSION_ID = OntologyVersionId('r0-ontology-utility-jacket-v1')

/** Reserved TrendCluster id (display name TC-KHAKI-URBAN-UTILITY). */
export const R0_CLUSTER_ID = TrendClusterId('r0-cluster-tc-khaki-urban-utility')

/** Reserved DesignOpportunity id (display DO-URBAN-UTILITY-TRANSITION). */
export const R0_OPPORTUNITY_ID = DesignOpportunityId('r0-opportunity-do-urban-utility-transition')

/** Reserved recorded public-rebuild decision id. */
export const R0_DECISION_ID = OpportunityDecisionId('r0-decision-do-urban-utility-recorded')

const envelope = {
  projectId: R0_PROJECT_ID as string,
  taskId: R0_TASK_ID as string,
  origin: 'system_seed' as const,
  accessMode: 'read-only' as const,
  status: 'active' as const,
  revision: 0,
  createdAt: R0_RESEARCH_ACCESSED_AT,
  updatedAt: R0_RESEARCH_ACCESSED_AT,
  createdBy: 'system-seed' as const,
  updatedBy: 'system-seed' as const,
  schemaVersion: FASHION_ANALYSIS_SCHEMA_VERSION as 0,
  archivedAt: null,
  staleReason: null,
}

type ProductSeed = {
  readonly key: 'e01' | 'e04' | 'e05' | 'e06' | 'e07' | 'e08'
  readonly displayName: string
  readonly brandOrCreator: string
  readonly sourceId: string
  readonly sampleId: string
  readonly evidenceIds: readonly string[]
  readonly attrs: readonly { path: string; raw: string; termId: string | null; review: 'accepted' | 'unknown' }[]
}

const PRODUCTS: readonly ProductSeed[] = [
  {
    key: 'e01',
    displayName: 'H&M Denim Utility Jacket',
    brandOrCreator: 'H&M US',
    sourceId: 'r0-source-e01',
    sampleId: 'r0-source-e01-sample',
    evidenceIds: ['r0-evidence-observed-hm-price', 'r0-evidence-derived-price-tiers'],
    attrs: [
      { path: 'color.family', raw: 'light khaki', termId: 'r0-term-khaki', review: 'accepted' },
      { path: 'material.primary', raw: '100% cotton denim', termId: 'r0-term-cotton-denim', review: 'accepted' },
      { path: 'category', raw: 'utility jacket', termId: 'r0-term-utility-jacket', review: 'accepted' },
      { path: 'silhouette.fit', raw: '', termId: null, review: 'unknown' },
    ],
  },
  {
    key: 'e04',
    displayName: 'MANGO Funnel Neck Parka with Pockets',
    brandOrCreator: 'MANGO US',
    sourceId: 'r0-source-e04',
    sampleId: 'r0-source-e04-sample',
    evidenceIds: ['r0-evidence-observed-discount-vs-stock', 'r0-evidence-derived-price-tiers'],
    attrs: [
      { path: 'category', raw: 'funnel-neck parka', termId: 'r0-term-utility-jacket', review: 'accepted' },
      { path: 'structure.neck', raw: 'funnel neck', termId: 'r0-term-funnel-neck', review: 'accepted' },
      { path: 'structure.pocket', raw: 'with pockets', termId: 'r0-term-pocket', review: 'accepted' },
      { path: 'color.family', raw: '', termId: null, review: 'unknown' },
    ],
  },
  {
    key: 'e05',
    displayName: 'MANGO Cotton Jacket with Contrasting Collar',
    brandOrCreator: 'MANGO US',
    sourceId: 'r0-source-e05',
    sampleId: 'r0-source-e05-sample',
    evidenceIds: ['r0-evidence-derived-price-tiers'],
    attrs: [
      { path: 'category', raw: 'cotton jacket', termId: 'r0-term-utility-jacket', review: 'accepted' },
      { path: 'structure.collar', raw: 'contrasting collar', termId: 'r0-term-contrasting-collar', review: 'accepted' },
      { path: 'material.primary', raw: 'cotton', termId: 'r0-term-cotton-denim', review: 'accepted' },
    ],
  },
  {
    key: 'e06',
    displayName: 'MANGO Oversized Denim Parka',
    brandOrCreator: 'MANGO US',
    sourceId: 'r0-source-e06',
    sampleId: 'r0-source-e06-sample',
    evidenceIds: ['r0-evidence-derived-price-tiers'],
    attrs: [
      { path: 'category', raw: 'oversized denim parka', termId: 'r0-term-utility-jacket', review: 'accepted' },
      { path: 'silhouette.fit', raw: 'oversized', termId: 'r0-term-oversized', review: 'accepted' },
      { path: 'material.primary', raw: 'denim', termId: 'r0-term-cotton-denim', review: 'accepted' },
    ],
  },
  {
    key: 'e07',
    displayName: 'Princess Polly Livya Cotton Utility Jacket',
    brandOrCreator: 'Princess Polly / Nordstrom',
    sourceId: 'r0-source-e07',
    sampleId: 'r0-source-e07-sample',
    evidenceIds: ['r0-evidence-derived-price-tiers'],
    attrs: [
      { path: 'category', raw: 'cotton utility jacket', termId: 'r0-term-utility-jacket', review: 'accepted' },
      { path: 'style.family', raw: 'utility', termId: 'r0-term-utility-military', review: 'accepted' },
      { path: 'color.family', raw: '', termId: null, review: 'unknown' },
    ],
  },
  {
    key: 'e08',
    displayName: 'Baukjen Drake Utility Jacket',
    brandOrCreator: 'Baukjen / Nordstrom',
    sourceId: 'r0-source-e08',
    sampleId: 'r0-source-e08-sample',
    evidenceIds: ['r0-evidence-derived-price-tiers'],
    attrs: [
      { path: 'category', raw: 'utility jacket', termId: 'r0-term-utility-jacket', review: 'accepted' },
      { path: 'color.family', raw: 'deep khaki', termId: 'r0-term-khaki', review: 'accepted' },
      { path: 'material.primary', raw: 'organic cotton', termId: 'r0-term-cotton-denim', review: 'accepted' },
    ],
  },
]

const TERM_DEFS: readonly {
  id: string
  domain: string
  label: string
  definition: string
  aliases?: readonly string[]
}[] = [
  { id: 'r0-term-utility-jacket', domain: 'category', label: 'Utility Jacket', definition: 'Outerwear with utility/military cues for Womenswear path.', aliases: ['field jacket', 'utility shirt'] },
  { id: 'r0-term-khaki', domain: 'color', label: 'Khaki', definition: 'Khaki / khaki-coded color family used on recorded pages.', aliases: ['light khaki', 'deep khaki'] },
  { id: 'r0-term-utility-military', domain: 'style', label: 'Utility / Military', definition: 'Utility or military reference style, not a sales claim.' },
  { id: 'r0-term-cotton-denim', domain: 'material', label: 'Cotton / Denim', definition: 'Cotton or denim material tendency from page text.' },
  { id: 'r0-term-oversized', domain: 'structure', label: 'Oversized', definition: 'Oversized silhouette cue from listing title/text.' },
  { id: 'r0-term-cropped', domain: 'structure', label: 'Cropped', definition: 'Cropped length cue when present on listing.' },
  { id: 'r0-term-funnel-neck', domain: 'structure', label: 'Funnel Neck', definition: 'Funnel-neck construction cue.' },
  { id: 'r0-term-contrasting-collar', domain: 'structure', label: 'Contrasting Collar', definition: 'Contrasting collar construction cue.' },
  { id: 'r0-term-pocket', domain: 'structure', label: 'Pocket Detail', definition: 'Visible pocket detail cue.' },
]

/** Canonical R0 OntologyVersion body. */
export const R0_ONTOLOGY_VERSION_RECORD: OntologyVersionRecordV0 = {
  ...envelope,
  versionLabel: 'utility-jacket-lite-v1',
  ontologyStatus: 'published',
  scopeNote: 'R0 Ontology Lite for the US womens khaki utility jacket public rebuild path only.',
  publishedAt: R0_RESEARCH_ACCESSED_AT,
}

/** R0 OntologyTerm seeds. */
export const R0_ONTOLOGY_TERM_SEEDS: readonly { id: ReturnType<typeof OntologyTermId>; record: OntologyTermRecordV0 }[] =
  TERM_DEFS.map(term => ({
    id: OntologyTermId(term.id),
    record: {
      ...envelope,
      ontologyVersionId: R0_ONTOLOGY_VERSION_ID as string,
      domain: term.domain,
      canonicalLabel: term.label,
      aliases: [...(term.aliases ?? [])],
      parentTermId: null,
      externalMappings: [],
      definition: term.definition,
      termStatus: 'active',
    },
  }))

/** R0 MarketItem seeds (E01/E04–E08 only; E02/E03 stay category Samples). */
export const R0_MARKET_ITEM_SEEDS: readonly { id: ReturnType<typeof MarketItemId>; record: MarketItemRecordV0 }[] =
  PRODUCTS.map(product => ({
    id: MarketItemId(`r0-item-${product.key}`),
    record: {
      ...envelope,
      itemType: 'garment_product',
      displayName: product.displayName,
      brandOrCreator: product.brandOrCreator,
      categoryCandidate: 'utility jacket',
      observationLinks: [{
        sampleId: product.sampleId,
        sourceId: product.sourceId,
        evidenceIds: [...product.evidenceIds],
      }],
      dedupeStatus: 'unreviewed',
      matchingMethod: 'manual',
      matchingScore: null,
      humanConfirmedBy: null,
      humanConfirmedAt: null,
    },
  }))

/** R0 AttributeAssertion seeds. */
export const R0_ASSERTION_SEEDS: readonly { id: ReturnType<typeof AttributeAssertionId>; record: AttributeAssertionRecordV0 }[] =
  PRODUCTS.flatMap(product => product.attrs.map((attr, index) => ({
    id: AttributeAssertionId(`r0-assert-${product.key}-${index + 1}`),
    record: {
      ...envelope,
      subjectType: 'market_item' as const,
      subjectId: `r0-item-${product.key}`,
      attributePath: attr.path,
      rawValue: attr.raw,
      normalizedTermId: attr.termId,
      ontologyVersionId: R0_ONTOLOGY_VERSION_ID as string,
      assertionSource: 'page_text' as const,
      evidenceIds: [...product.evidenceIds],
      confidence: null,
      reviewStatus: attr.review,
      reviewedBy: attr.review === 'unknown' ? null : 'system-seed' as const,
      reviewedAt: attr.review === 'unknown' ? null : R0_RESEARCH_ACCESSED_AT,
      correctionReason: null,
      supersedesAssertionId: null,
    },
  })))

const SIGNAL_45_ID = PopularitySignalId('r0-signal-pinterest-utility-shirt-45')
const SIGNAL_65_ID = PopularitySignalId('r0-signal-pinterest-field-jacket-65')
const SIGNAL_CROSS_ID = PopularitySignalId('r0-signal-cross-source-presence')

/** R0 PopularitySignal seeds. */
export const R0_SIGNAL_SEEDS: readonly { id: ReturnType<typeof PopularitySignalId>; record: PopularitySignalRecordV0 }[] = [
  {
    id: SIGNAL_45_ID,
    record: {
      ...envelope,
      signalType: 'search_growth',
      subjectRefs: [{ type: 'evidence', id: 'r0-evidence-observed-pinterest-search' }],
      platform: 'Pinterest',
      marketRegion: 'recorded-report-window',
      windowStart: '2024-09',
      windowEnd: '2025-08',
      observedAt: R0_RESEARCH_ACCESSED_AT,
      rawValue: '+45%',
      rawUnit: 'search_change_vs_prior_year',
      normalizedValue: null,
      normalizationMethod: null,
      baseline: 'prior year same window (report)',
      sampleSize: null,
      evidenceIds: ['r0-evidence-observed-pinterest-search'],
      methodVersion: 'r0-pinterest-predicts-extract-v1',
      limitations: [
        'G1 search interest only; not US womenswear sales.',
        'Report window is not a live API sample.',
      ],
      signalStatus: 'observed',
    },
  },
  {
    id: SIGNAL_65_ID,
    record: {
      ...envelope,
      signalType: 'search_growth',
      subjectRefs: [{ type: 'evidence', id: 'r0-evidence-observed-pinterest-search' }],
      platform: 'Pinterest',
      marketRegion: 'recorded-report-window',
      windowStart: '2024-09',
      windowEnd: '2025-08',
      observedAt: R0_RESEARCH_ACCESSED_AT,
      rawValue: '+65%',
      rawUnit: 'search_change_vs_prior_year',
      normalizedValue: null,
      normalizationMethod: null,
      baseline: 'prior year same window (report)',
      sampleSize: null,
      evidenceIds: ['r0-evidence-observed-pinterest-search'],
      methodVersion: 'r0-pinterest-predicts-extract-v1',
      limitations: [
        'Metric wording is "field jacket outfit men"; not a womenswear sell-through claim.',
        'G1 only.',
      ],
      signalStatus: 'observed',
    },
  },
  {
    id: SIGNAL_CROSS_ID,
    record: {
      ...envelope,
      signalType: 'cross_source_presence',
      subjectRefs: [
        { type: 'evidence', id: 'r0-evidence-observed-pinterest-search' },
        { type: 'evidence', id: 'r0-evidence-observed-vogue-khaki' },
        { type: 'evidence', id: 'r0-evidence-observed-hm-price' },
      ],
      platform: 'multi',
      marketRegion: 'US public web (recorded)',
      windowStart: null,
      windowEnd: null,
      observedAt: R0_RESEARCH_ACCESSED_AT,
      rawValue: 'present',
      rawUnit: 'boolean_presence',
      normalizedValue: null,
      normalizationMethod: 'manual_union_of_confirmed_evidence',
      baseline: null,
      sampleSize: '3 evidence rows',
      evidenceIds: [
        'r0-evidence-observed-pinterest-search',
        'r0-evidence-observed-vogue-khaki',
        'r0-evidence-observed-hm-price',
      ],
      methodVersion: 'r0-cross-source-presence-v1',
      limitations: [
        'Sources are not the same metric family; presence is not a summed popularity score.',
        'Does not prove demand magnitude.',
      ],
      signalStatus: 'computed',
    },
  },
]

const RUN_NORMALIZE_ID = AnalysisRunId('r0-run-normalize-items')
const RUN_SIGNAL_ID = AnalysisRunId('r0-run-derive-signals')
const RUN_CLUSTER_ID = AnalysisRunId('r0-run-build-cluster')
const RUN_OPP_ID = AnalysisRunId('r0-run-build-opportunity')

function completedRun(
  id: string,
  runType: AnalysisRunRecordV0['runType'],
  methodName: string,
  methodVersion: string,
  inputs: AnalysisRunRecordV0['inputRefs'],
  outputs: AnalysisRunRecordV0['outputRefs'],
): { id: ReturnType<typeof AnalysisRunId>; record: AnalysisRunRecordV0 } {
  return {
    id: AnalysisRunId(id),
    record: {
      ...envelope,
      runType,
      methodName,
      methodVersion,
      inputRefs: inputs,
      outputRefs: outputs,
      ontologyVersionId: R0_ONTOLOGY_VERSION_ID as string,
      ruleSetVersion: 'r0-quality-v1',
      runStatus: 'completed',
      startedAt: R0_RESEARCH_ACCESSED_AT,
      finishedAt: R0_RESEARCH_ACCESSED_AT,
      errorCode: null,
      errorSummary: null,
      qualityResults: [{
        ruleId: 'parent-chain',
        ruleVersion: '1',
        targetRef: outputs[0] ?? { type: 'analysis_run', id, revision: 0 },
        status: 'pass',
        message: 'R0 seed parent chain matches project/task.',
        evidenceRefs: [],
      }],
      idempotencyKey: id,
    },
  }
}

/** R0 AnalysisRun seeds. */
export const R0_ANALYSIS_RUN_SEEDS = [
  completedRun(
    RUN_NORMALIZE_ID as string,
    'normalize',
    'r0-seed-normalize-market-items',
    'v1',
    [{ type: 'research_task', id: R0_TASK_ID as string, revision: 0 }],
    R0_MARKET_ITEM_SEEDS.map(item => ({ type: 'market_item', id: item.id as string, revision: 0 })),
  ),
  completedRun(
    RUN_SIGNAL_ID as string,
    'derive_signal',
    'r0-seed-derive-signals',
    'v1',
    [{ type: 'evidence', id: 'r0-evidence-observed-pinterest-search', revision: 0 }],
    R0_SIGNAL_SEEDS.map(signal => ({ type: 'popularity_signal', id: signal.id as string, revision: 0 })),
  ),
  completedRun(
    RUN_CLUSTER_ID as string,
    'build_cluster',
    'r0-seed-build-cluster',
    'v1',
    R0_MARKET_ITEM_SEEDS.map(item => ({ type: 'market_item', id: item.id as string, revision: 0 })),
    [{ type: 'trend_cluster', id: R0_CLUSTER_ID as string, revision: 0 }],
  ),
  completedRun(
    RUN_OPP_ID as string,
    'build_opportunity',
    'r0-seed-build-opportunity',
    'v1',
    [{ type: 'trend_cluster', id: R0_CLUSTER_ID as string, revision: 0 }],
    [{ type: 'design_opportunity', id: R0_OPPORTUNITY_ID as string, revision: 0 }],
  ),
] as const

const sharedAssertionIds = R0_ASSERTION_SEEDS
  .filter(row => row.record.attributePath === 'category' || row.record.attributePath === 'color.family')
  .map(row => row.id as string)

/** R0 TrendCluster seed. */
export const R0_CLUSTER_SEED: { id: ReturnType<typeof TrendClusterId>; record: TrendClusterRecordV0 } = {
  id: R0_CLUSTER_ID,
  record: {
    ...envelope,
    name: 'TC-KHAKI-URBAN-UTILITY',
    definition: 'Recorded public-web cluster: khaki/utility outerwear cues across ecommerce and editorial sources for the R0 rebuild.',
    memberRefs: [
      ...R0_MARKET_ITEM_SEEDS.map(item => ({ type: 'market_item' as const, id: item.id as string })),
      { type: 'signal' as const, id: SIGNAL_45_ID as string },
      { type: 'signal' as const, id: SIGNAL_65_ID as string },
      { type: 'signal' as const, id: SIGNAL_CROSS_ID as string },
    ],
    sharedAttributeAssertionIds: sharedAssertionIds,
    signalIds: [SIGNAL_45_ID as string, SIGNAL_65_ID as string, SIGNAL_CROSS_ID as string],
    clusterMethod: 'rule',
    methodVersion: 'r0-cluster-rule-v1',
    marketRegions: ['US'],
    timeContext: 'Recorded public pages 2026-09-21; Pinterest report window 2024-09 to 2025-08',
    evidenceGrade: 'G1',
    counterEvidence: [
      'Price span ~US$40–345 across members; not a single price tier.',
      'Some listings are discounted with scarce sizes; discount ≠ sell-through.',
    ],
    biasesAndGaps: [
      'Only six product pages plus a few editorials; not a market census.',
      'Men-coded Pinterest query cannot be read as US womenswear demand.',
      'No brand DNA or lead-time validation (needs_validation evidence remains open).',
    ],
    lifecycleHypothesis: 'Public khaki/utility cues may inform a Fall transition silhouette exploration; not a forecast.',
    humanReviewStatus: 'draft',
    analysisRunId: RUN_CLUSTER_ID as string,
  },
}

/** R0 DesignOpportunity seed (candidate; recorded decision is separate). */
export const R0_OPPORTUNITY_SEED: { id: ReturnType<typeof DesignOpportunityId>; record: DesignOpportunityRecordV0 } = {
  id: R0_OPPORTUNITY_ID,
  record: {
    ...envelope,
    title: 'DO-URBAN-UTILITY-TRANSITION',
    opportunityStatement: 'Explore a khaki urban-utility jacket expression that separates quality/silhouette from chasing any single recorded SKU.',
    trendClusterIds: [R0_CLUSTER_ID as string],
    targetMarket: 'US womenswear (hypothesis; needs designer validation)',
    targetUserHypothesis: 'Shoppers responding to khaki/utility cues in public editorial and ecommerce listings.',
    category: 'Utility Jacket',
    timing: 'Fall transition (hypothesis)',
    commercialHypotheses: [
      'Price-tier differentiation may matter more than copying one listing.',
    ],
    creativeSpaces: [
      'Funnel-neck / contrasting-collar / pocket constructions observed on public pages.',
    ],
    saturationRisks: [
      'Mass listings already show utility cues; differentiation risk is open.',
    ],
    copyingOrIpRisks: [
      'Do not reproduce branded product images or protected silhouettes from recorded pages.',
    ],
    unknowns: [
      'Brand fit, exact price band, and development lead time remain needs_validation.',
    ],
    evidenceGrade: 'G1',
    reviewStatus: 'selected',
    analysisRunId: RUN_OPP_ID as string,
    currentDecisionId: R0_DECISION_ID as string,
    publicRebuildRecorded: true,
  },
}

/**
 * R0 OpportunityDecision: recorded public-rebuild human selection for F3-01 demo,
 * not a real commercial designer adoption.
 */
export const R0_DECISION_SEED: { id: ReturnType<typeof OpportunityDecisionId>; record: OpportunityDecisionRecordV0 } = {
  id: R0_DECISION_ID,
  record: {
    projectId: R0_PROJECT_ID as string,
    taskId: R0_TASK_ID as string,
    opportunityId: R0_OPPORTUNITY_ID as string,
    opportunityRevision: 0,
    action: 'selected',
    reasonCodes: ['public_rebuild_recorded', 'evidence_sufficient', 'needs_designer_validation'],
    note: 'Recorded public-rebuild selection so F3-01 can demonstrate Brief/ConceptSet. Not a real designer commercial adoption.',
    actor: 'local-human',
    createdAt: R0_RESEARCH_ACCESSED_AT,
    schemaVersion: FASHION_ANALYSIS_SCHEMA_VERSION,
    publicRebuildRecorded: true,
  },
}

/**
 * Whether a stored R0 analysis envelope satisfies public-rebuild invariants.
 * @param record - Candidate row.
 * @param projectId - Expected owning project.
 */
export function isValidR0AnalysisSeed(
  record: { projectId: string; taskId: string; origin: string; accessMode: string },
  projectId: ProjectId = R0_PROJECT_ID,
): boolean {
  return record.projectId === String(projectId)
    && record.taskId === String(R0_TASK_ID)
    && record.origin === 'system_seed'
    && record.accessMode === 'read-only'
}
