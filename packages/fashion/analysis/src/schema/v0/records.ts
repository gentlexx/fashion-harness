/**
 * Fashion Analysis Storage Domain record schemas v0.
 * @module @gentlexx/dsh-fashion-analysis/src/schema/v0/records
 */

import { z } from 'zod'
import { analysisEnvelopeV0, actorRefV0 } from './envelope.ts'
import { FASHION_ANALYSIS_SCHEMA_VERSION } from '../../types.ts'

const observationLinkV0 = z.object({
  sampleId: z.string().min(1),
  sourceId: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)),
}).strict()

/** Durable MarketItem row body. */
export const marketItemRecordV0 = z.object({
  ...analysisEnvelopeV0,
  itemType: z.enum(['garment_product', 'content_post', 'trend_topic']),
  displayName: z.string().min(1).max(200),
  brandOrCreator: z.string().max(200).nullable(),
  categoryCandidate: z.string().max(200).nullable(),
  observationLinks: z.array(observationLinkV0).min(1),
  dedupeStatus: z.enum(['unreviewed', 'candidate_match', 'confirmed_same', 'confirmed_distinct']),
  matchingMethod: z.enum(['manual', 'exact_external_id', 'rule']),
  matchingScore: z.number().nullable(),
  humanConfirmedBy: actorRefV0.nullable(),
  humanConfirmedAt: z.iso.datetime().nullable(),
}).strict()

/** Durable MarketItem record body. */
export type MarketItemRecordV0 = z.infer<typeof marketItemRecordV0>

/** Durable OntologyVersion row body. */
export const ontologyVersionRecordV0 = z.object({
  ...analysisEnvelopeV0,
  versionLabel: z.string().min(1).max(80),
  ontologyStatus: z.enum(['draft', 'published', 'superseded', 'archived']),
  scopeNote: z.string().max(2000),
  publishedAt: z.iso.datetime().nullable(),
}).strict()

/** Durable OntologyVersion record body. */
export type OntologyVersionRecordV0 = z.infer<typeof ontologyVersionRecordV0>

const externalMappingV0 = z.object({
  system: z.string().min(1),
  code: z.string().min(1),
  label: z.string().nullable(),
}).strict()

/** Durable OntologyTerm row body. */
export const ontologyTermRecordV0 = z.object({
  ...analysisEnvelopeV0,
  ontologyVersionId: z.string().min(1),
  domain: z.string().min(1).max(80),
  canonicalLabel: z.string().min(1).max(120),
  aliases: z.array(z.string().min(1).max(120)),
  parentTermId: z.string().min(1).nullable(),
  externalMappings: z.array(externalMappingV0),
  definition: z.string().max(2000),
  termStatus: z.enum(['active', 'deprecated', 'archived']),
}).strict()

/** Durable OntologyTerm record body. */
export type OntologyTermRecordV0 = z.infer<typeof ontologyTermRecordV0>

/** Durable AttributeAssertion row body. */
export const attributeAssertionRecordV0 = z.object({
  ...analysisEnvelopeV0,
  subjectType: z.literal('market_item'),
  subjectId: z.string().min(1),
  attributePath: z.string().min(1).max(120),
  rawValue: z.string().max(2000),
  normalizedTermId: z.string().min(1).nullable(),
  ontologyVersionId: z.string().min(1),
  assertionSource: z.enum(['page_text', 'human', 'rule']),
  evidenceIds: z.array(z.string().min(1)),
  confidence: z.number().nullable(),
  reviewStatus: z.enum(['unreviewed', 'accepted', 'corrected', 'rejected', 'unknown']),
  reviewedBy: actorRefV0.nullable(),
  reviewedAt: z.iso.datetime().nullable(),
  correctionReason: z.string().max(2000).nullable(),
  supersedesAssertionId: z.string().min(1).nullable(),
}).strict()

/** Durable AttributeAssertion record body. */
export type AttributeAssertionRecordV0 = z.infer<typeof attributeAssertionRecordV0>

const subjectRefV0 = z.object({
  type: z.enum(['market_item', 'sample', 'source', 'evidence', 'cluster']),
  id: z.string().min(1),
}).strict()

/** Durable PopularitySignal row body. */
export const popularitySignalRecordV0 = z.object({
  ...analysisEnvelopeV0,
  signalType: z.enum([
    'search_growth',
    'rank_position',
    'view_count',
    'engagement',
    'save_rate',
    'sellout_claim',
    'cross_source_presence',
  ]),
  subjectRefs: z.array(subjectRefV0).min(1),
  platform: z.string().min(1).max(80),
  marketRegion: z.string().max(80).nullable(),
  windowStart: z.string().max(80).nullable(),
  windowEnd: z.string().max(80).nullable(),
  observedAt: z.iso.datetime(),
  rawValue: z.string().min(1).max(120),
  rawUnit: z.string().min(1).max(40),
  normalizedValue: z.string().max(120).nullable(),
  normalizationMethod: z.string().max(200).nullable(),
  baseline: z.string().max(200).nullable(),
  sampleSize: z.string().max(80).nullable(),
  evidenceIds: z.array(z.string().min(1)).min(1),
  methodVersion: z.string().min(1).max(80),
  limitations: z.array(z.string().min(1).max(500)),
  signalStatus: z.enum(['draft', 'observed', 'computed', 'invalidated', 'stale']),
}).strict()

/** Durable PopularitySignal record body. */
export type PopularitySignalRecordV0 = z.infer<typeof popularitySignalRecordV0>

const lineageRefV0 = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
  revision: z.number().int().nonnegative(),
}).strict()

const qualityResultV0 = z.object({
  ruleId: z.string().min(1),
  ruleVersion: z.string().min(1),
  targetRef: lineageRefV0,
  status: z.enum(['pass', 'fail', 'warning', 'not_applicable']),
  message: z.string().max(2000),
  evidenceRefs: z.array(lineageRefV0),
}).strict()

/** Durable AnalysisRun row body. */
export const analysisRunRecordV0 = z.object({
  ...analysisEnvelopeV0,
  runType: z.enum(['normalize', 'quality_check', 'derive_signal', 'build_cluster', 'build_opportunity']),
  methodName: z.string().min(1).max(120),
  methodVersion: z.string().min(1).max(80),
  inputRefs: z.array(lineageRefV0),
  outputRefs: z.array(lineageRefV0),
  ontologyVersionId: z.string().min(1).nullable(),
  ruleSetVersion: z.string().max(80).nullable(),
  runStatus: z.enum(['started', 'completed', 'failed', 'aborted']),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
  errorCode: z.string().max(80).nullable(),
  errorSummary: z.string().max(2000).nullable(),
  qualityResults: z.array(qualityResultV0),
  idempotencyKey: z.string().max(120).nullable(),
}).strict()

/** Durable AnalysisRun record body. */
export type AnalysisRunRecordV0 = z.infer<typeof analysisRunRecordV0>

const memberRefV0 = z.object({
  type: z.enum(['market_item', 'signal']),
  id: z.string().min(1),
}).strict()

/** Durable TrendCluster row body. */
export const trendClusterRecordV0 = z.object({
  ...analysisEnvelopeV0,
  name: z.string().min(1).max(120),
  definition: z.string().min(1).max(4000),
  memberRefs: z.array(memberRefV0).min(1),
  sharedAttributeAssertionIds: z.array(z.string().min(1)),
  signalIds: z.array(z.string().min(1)),
  clusterMethod: z.enum(['manual', 'rule']),
  methodVersion: z.string().min(1).max(80),
  marketRegions: z.array(z.string().min(1).max(80)),
  timeContext: z.string().min(1).max(200),
  evidenceGrade: z.enum(['G0', 'G1', 'G2', 'G3', 'G4']),
  counterEvidence: z.array(z.string().min(1).max(500)),
  biasesAndGaps: z.array(z.string().min(1).max(500)),
  lifecycleHypothesis: z.string().max(2000).nullable(),
  humanReviewStatus: z.enum(['draft', 'accepted', 'rejected', 'needs_more_research']),
  analysisRunId: z.string().min(1).nullable(),
}).strict()

/** Durable TrendCluster record body. */
export type TrendClusterRecordV0 = z.infer<typeof trendClusterRecordV0>

/** Durable DesignOpportunity row body. */
export const designOpportunityRecordV0 = z.object({
  ...analysisEnvelopeV0,
  title: z.string().min(1).max(200),
  opportunityStatement: z.string().min(1).max(4000),
  trendClusterIds: z.array(z.string().min(1)).min(1),
  targetMarket: z.string().min(1).max(200),
  targetUserHypothesis: z.string().min(1).max(2000),
  category: z.string().min(1).max(120),
  timing: z.string().min(1).max(200),
  commercialHypotheses: z.array(z.string().min(1).max(500)),
  creativeSpaces: z.array(z.string().min(1).max(500)),
  saturationRisks: z.array(z.string().min(1).max(500)),
  copyingOrIpRisks: z.array(z.string().min(1).max(500)),
  unknowns: z.array(z.string().min(1).max(500)),
  evidenceGrade: z.enum(['G0', 'G1', 'G2', 'G3', 'G4']),
  reviewStatus: z.enum(['candidate', 'selected', 'rejected', 'needs_more_research']),
  analysisRunId: z.string().min(1).nullable(),
  currentDecisionId: z.string().min(1).nullable(),
  publicRebuildRecorded: z.boolean(),
}).strict()

/** Durable DesignOpportunity record body. */
export type DesignOpportunityRecordV0 = z.infer<typeof designOpportunityRecordV0>

/** Durable OpportunityDecision row body (no mutable envelope). */
export const opportunityDecisionRecordV0 = z.object({
  projectId: z.string().min(1),
  taskId: z.string().min(1),
  opportunityId: z.string().min(1),
  opportunityRevision: z.number().int().nonnegative(),
  action: z.enum(['selected', 'rejected', 'needs_more_research']),
  reasonCodes: z.array(z.enum([
    'evidence_sufficient',
    'evidence_weak',
    'brand_fit_unknown',
    'saturated',
    'copying_risk',
    'needs_designer_validation',
    'other',
    'public_rebuild_recorded',
  ])).min(1),
  note: z.string().min(1).max(4000),
  actor: z.literal('local-human'),
  createdAt: z.iso.datetime(),
  schemaVersion: z.literal(FASHION_ANALYSIS_SCHEMA_VERSION),
  publicRebuildRecorded: z.boolean(),
}).strict()

/** Durable OpportunityDecision record body. */
export type OpportunityDecisionRecordV0 = z.infer<typeof opportunityDecisionRecordV0>
