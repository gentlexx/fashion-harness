/**
 * Fashion Design Storage Domain record schemas v0.
 * @module @gentlexx/dsh-fashion-design/src/schema/v0/records
 */

import { z } from 'zod'
import { constraintEntryV0, designEnvelopeV0 } from './envelope.ts'

const priceTargetV0 = z.object({
  amount: z.string().max(40).nullable(),
  currency: z.string().max(16).nullable(),
  rangeText: z.string().max(200).nullable(),
  status: z.enum(['known', 'hypothesis', 'unknown']),
}).strict()

const briefConfirmationV0 = z.object({
  actorId: z.string().min(1).max(80),
  actorKind: z.literal('human'),
  confirmedAt: z.iso.datetime(),
}).strict()

/** Durable DesignOpportunityBrief row body. */
export const designBriefRecordV0 = z.object({
  ...designEnvelopeV0,
  opportunityId: z.string().min(1),
  opportunityRevision: z.number().int().nonnegative(),
  selectionDecisionId: z.string().min(1),
  taskId: z.string().min(1),
  market: z.string().min(1).max(200),
  season: z.string().min(1).max(120),
  category: z.string().min(1).max(120),
  targetUser: z.string().min(1).max(500),
  brandContext: z.string().max(500).nullable(),
  priceTarget: priceTargetV0.nullable(),
  mustKeep: z.array(constraintEntryV0),
  mustAvoid: z.array(constraintEntryV0),
  materialsConstraints: z.array(constraintEntryV0),
  costConstraints: z.array(constraintEntryV0),
  productionConstraints: z.array(constraintEntryV0),
  differentiationGoals: z.array(constraintEntryV0),
  openQuestions: z.array(constraintEntryV0),
  constraintSources: z.array(z.string().min(1).max(200)),
  confirmation: briefConfirmationV0.nullable(),
  status: z.enum(['draft', 'confirmed', 'stale', 'archived']),
}).strict()

/** Durable DesignOpportunityBrief record body. */
export type DesignBriefRecordV0 = z.infer<typeof designBriefRecordV0>

const pairwiseDifferenceV0 = z.object({
  conceptAId: z.string().min(1),
  conceptBId: z.string().min(1),
  dimension: z.enum([
    'silhouette',
    'proportion_and_length',
    'material_direction',
    'construction_and_details',
    'functional_value',
    'target_use_scenarios',
    'color_direction',
  ]),
  conceptAValueRef: z.string().min(1).max(500),
  conceptBValueRef: z.string().min(1).max(500),
  differenceNote: z.string().min(1).max(2000),
  checkedBy: z.enum(['human', 'system-precheck']),
  checkedAt: z.iso.datetime(),
}).strict()

const differentiationCheckV0 = z.object({
  ruleVersion: z.string().min(1).max(40),
  passed: z.boolean(),
  pairwise: z.array(pairwiseDifferenceV0),
  failureReasons: z.array(z.string().min(1).max(500)),
  evaluatedAt: z.iso.datetime(),
}).strict()

const readinessCheckV0 = z.object({
  passed: z.boolean(),
  failureReasons: z.array(z.string().min(1).max(500)),
  evaluatedAt: z.iso.datetime(),
}).strict()

const conceptRefV0 = z.object({
  conceptId: z.string().min(1),
  conceptRevision: z.number().int().nonnegative(),
}).strict()

/** Durable ConceptSet row body. */
export const conceptSetRecordV0 = z.object({
  ...designEnvelopeV0,
  briefId: z.string().min(1),
  briefRevision: z.number().int().nonnegative(),
  conceptRefs: z.array(conceptRefV0).max(3),
  differentiationRuleVersion: z.string().min(1).max(40),
  differentiationCheck: differentiationCheckV0.nullable(),
  readinessCheck: readinessCheckV0.nullable(),
  status: z.enum(['draft', 'review_ready', 'stale', 'archived']),
  isCurrent: z.boolean(),
}).strict()

/** Durable ConceptSet record body. */
export type ConceptSetRecordV0 = z.infer<typeof conceptSetRecordV0>

const marketEvidenceLinkV0 = z.object({
  type: z.enum(['evidence', 'market_item', 'signal', 'trend_cluster']),
  id: z.string().min(1),
  usedFor: z.string().min(1).max(200),
}).strict()

const similarityRiskV0 = z.object({
  reference: z.string().min(1).max(500),
  similarFeature: z.string().min(1).max(500),
  difference: z.string().min(1).max(1000),
  riskLevel: z.enum(['low', 'medium', 'high', 'unknown']),
  needsExpertReview: z.boolean(),
  note: z.string().max(2000).nullable(),
}).strict()

const constraintCoverageV0 = z.object({
  constraintId: z.string().min(1).max(80),
  covered: z.boolean(),
  note: z.string().max(1000).nullable(),
}).strict()

/** Durable DesignConcept row body. */
export const designConceptRecordV0 = z.object({
  ...designEnvelopeV0,
  conceptSetId: z.string().min(1),
  briefId: z.string().min(1),
  briefRevision: z.number().int().nonnegative(),
  conceptName: z.string().min(1).max(120),
  designIntent: z.string().min(1).max(2000),
  silhouette: z.string().min(1).max(500),
  proportionAndLength: z.string().min(1).max(500),
  materialDirection: z.string().min(1).max(500),
  colorDirection: z.string().min(1).max(500),
  constructionAndDetails: z.array(z.string().min(1).max(500)),
  functionalValue: z.array(z.string().min(1).max(500)),
  targetUseScenarios: z.array(z.string().min(1).max(500)),
  marketEvidenceLinks: z.array(marketEvidenceLinkV0),
  originalTransformationNotes: z.array(z.string().min(1).max(2000)),
  competitorSimilarityRisks: z.array(similarityRiskV0),
  productionUnknowns: z.array(z.string().min(1).max(1000)),
  constraintCoverage: z.array(constraintCoverageV0),
  status: z.enum(['draft', 'review_ready', 'stale', 'archived']),
}).strict()

/** Durable DesignConcept record body. */
export type DesignConceptRecordV0 = z.infer<typeof designConceptRecordV0>

const attributeConsistencyCheckV0 = z.object({
  checkId: z.string().min(1).max(80),
  status: z.enum(['pass', 'fail', 'warning', 'not_applicable']),
  message: z.string().min(1).max(1000),
}).strict()

const contentCredentialV0 = z.object({
  status: z.enum(['not_available', 'present_unverified', 'verified', 'invalid']),
  manifestRef: z.string().max(200).nullable(),
}).strict()

/** Durable VisualDraft row body. */
export const visualDraftRecordV0 = z.object({
  ...designEnvelopeV0,
  conceptId: z.string().min(1),
  conceptRevision: z.number().int().nonnegative(),
  generationMode: z.enum(['recorded_fixture', 'manual_upload', 'provider_generated']),
  providerRef: z.string().max(120).nullable(),
  modelRef: z.string().max(120).nullable(),
  providerJobRef: z.string().max(200).nullable(),
  inputSnapshotRef: z.string().min(1).max(200),
  inputSnapshotHash: z.string().min(1).max(128),
  promptOrContextRef: z.string().max(200).nullable(),
  referenceAssetRefs: z.array(z.string().min(1).max(200)),
  artifactRef: z.string().max(200).nullable(),
  artifactHash: z.string().max(128).nullable(),
  mediaType: z.string().max(80).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  requestedAt: z.iso.datetime().nullable(),
  generatedAt: z.iso.datetime().nullable(),
  failedAt: z.iso.datetime().nullable(),
  status: z.enum([
    'not_requested',
    'queued',
    'running',
    'succeeded',
    'failed',
    'cancelled',
    'stale',
  ]),
  failureCode: z.string().max(80).nullable(),
  failureMessage: z.string().max(1000).nullable(),
  attributeConsistencyChecks: z.array(attributeConsistencyCheckV0),
  humanReviewStatus: z.enum(['not_reviewed', 'consistent', 'inconsistent', 'needs_revision']),
  usageBoundary: z.string().min(1).max(200),
  aiDisclosure: z.string().min(1).max(2000),
  contentCredential: contentCredentialV0.nullable(),
}).strict()

/** Durable VisualDraft record body. */
export type VisualDraftRecordV0 = z.infer<typeof visualDraftRecordV0>

/** Durable DesignArtifact row body. */
export const designArtifactRecordV0 = z.object({
  ...designEnvelopeV0,
  mediaType: z.string().min(1).max(80),
  contentHash: z.string().max(128).nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  projectRelativeRef: z.string().max(200).nullable(),
  tombstone: z.boolean(),
  tombstoneReason: z.string().max(1000).nullable(),
  deletedAt: z.iso.datetime().nullable(),
}).strict()

/** Durable DesignArtifact record body. */
export type DesignArtifactRecordV0 = z.infer<typeof designArtifactRecordV0>
