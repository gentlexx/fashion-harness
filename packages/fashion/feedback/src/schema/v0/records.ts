/**
 * Fashion Feedback Storage Domain record schemas v0.
 * @module @gentlexx/dsh-fashion-feedback/src/schema/v0/records
 */

import { z } from 'zod'
import {
  exactSubjectRefV0,
  feedbackActorV0,
  feedbackEnvelopeV0,
  outcomeSourceRefV0,
} from './envelope.ts'

const reasonCodeV0 = z.enum([
  'evidence_useful',
  'evidence_missing',
  'analysis_clear',
  'analysis_unreliable',
  'market_fit',
  'brand_fit',
  'originality_helpful',
  'similarity_risk',
  'silhouette_or_proportion',
  'material_or_process',
  'construction_or_function',
  'cost_or_production_unknown',
  'visual_mismatch',
  'handoff_usable',
  'too_much_manual_work',
  'terminology_unclear',
  'other',
])

const workflowStepV0 = z.object({
  stepKey: z.string().min(1).max(120),
  moduleId: z.string().min(1).max(120),
  moduleSchemaVersion: z.number().int().nonnegative(),
  relatedRefs: z.array(exactSubjectRefV0),
}).strict()

const subjectRefV0 = z.object({
  subjectType: z.enum(['deliverable', 'concept', 'brief', 'opportunity', 'evidence', 'workflow_step']),
  subjectId: z.string().min(1),
  subjectRevision: z.number().int().nonnegative(),
  relatedDeliverableRef: exactSubjectRefV0.nullable(),
  workflowStep: workflowStepV0.nullable(),
}).strict()

const modificationV0 = z.object({
  area: z.string().min(1).max(200),
  summary: z.string().min(1).max(2000),
  reasonCodes: z.array(reasonCodeV0),
  artifactRef: z.string().max(500).nullable(),
}).strict()

const metricValueV0 = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('integer'), value: z.number().int() }).strict(),
  z.object({ kind: z.literal('decimal_string'), value: z.string().min(1).max(80) }).strict(),
  z.object({
    kind: z.literal('ratio'),
    numerator: z.number(),
    denominator: z.number(),
  }).strict(),
  z.object({ kind: z.literal('unavailable'), reason: z.string().min(1).max(500) }).strict(),
])

/** Durable DesignerFeedback row. */
export const designerFeedbackRecordV0 = z.object({
  ...feedbackEnvelopeV0,
  subjectRef: subjectRefV0,
  action: z.enum(['adopted', 'modified', 'rejected', 'ignored', 'needs_follow_up', 'unable_to_assess']),
  reasonCodes: z.array(reasonCodeV0),
  reasonText: z.string().max(4000).nullable(),
  modifications: z.array(modificationV0),
  professionalValidity: z.enum(['valid', 'partly_valid', 'invalid', 'unknown']),
  revisionEffort: z.enum(['none', 'light', 'moderate', 'heavy', 'unknown']),
  timeSavedEstimate: z.enum(['not_estimated', 'none', 'under_15m', 'm15_to_30', 'm30_to_60', 'over_60m']).nullable(),
  feedbackActor: feedbackActorV0,
  followUpNeeded: z.boolean(),
  followUpNote: z.string().max(2000).nullable(),
}).strict()

/** Durable DesignerFeedback record. */
export type DesignerFeedbackRecordV0 = z.infer<typeof designerFeedbackRecordV0>

/** Durable OutcomeAvailability row. No numeric value field. */
export const outcomeAvailabilityRecordV0 = z.object({
  ...feedbackEnvelopeV0,
  deliverableRef: exactSubjectRefV0,
  conceptRef: exactSubjectRefV0,
  availability: z.enum(['not_yet_observed', 'not_available', 'not_authorized', 'available_partial', 'available']),
  reasonCode: z.string().min(1).max(120),
  reasonText: z.string().max(4000).nullable(),
  expectedAfter: z.iso.datetime().nullable(),
  asOf: z.iso.datetime(),
  actor: feedbackActorV0,
}).strict()

/** Durable OutcomeAvailability record. */
export type OutcomeAvailabilityRecordV0 = z.infer<typeof outcomeAvailabilityRecordV0>

/** Durable DevelopmentEvent row. */
export const developmentEventRecordV0 = z.object({
  ...feedbackEnvelopeV0,
  deliverableRef: exactSubjectRefV0,
  conceptRef: exactSubjectRefV0,
  stage: z.enum(['handed_off', 'sampled', 'revised_after_sample', 'produced', 'listed', 'selling', 'closed', 'stopped']),
  occurredAt: z.iso.datetime(),
  marketRegion: z.string().max(80).nullable(),
  channel: z.string().max(80).nullable(),
  businessContext: z.string().min(1).max(2000),
  sourceType: z.enum(['manual_entry', 'authorized_export']),
  sourceRef: outcomeSourceRefV0,
  verificationStatus: z.enum(['self_reported', 'source_attached', 'verified_against_source', 'not_verifiable']),
  limitations: z.array(z.string().min(1).max(500)),
  actor: feedbackActorV0,
}).strict()

/** Durable DevelopmentEvent record. */
export type DevelopmentEventRecordV0 = z.infer<typeof developmentEventRecordV0>

/** Durable metric definition row. */
export const outcomeMetricDefinitionRecordV0 = z.object({
  projectId: z.string().min(1).nullable(),
  metricKey: z.string().min(1).max(80),
  definitionVersion: z.string().min(1).max(40),
  displayName: z.string().min(1).max(200),
  valueType: z.enum(['integer', 'decimal_string', 'ratio']),
  unit: z.string().min(1).max(40),
  aggregationSemantics: z.enum(['point', 'window_total', 'window_average', 'end_of_window']),
  description: z.string().min(1).max(2000),
  requiredDimensions: z.array(z.string().min(1).max(80)),
  scope: z.enum(['catalog', 'project']),
  limitations: z.array(z.string().max(500)),
  schemaVersion: z.literal(0),
}).strict()

/** Durable metric definition record. */
export type OutcomeMetricDefinitionRecordV0 = z.infer<typeof outcomeMetricDefinitionRecordV0>

/** Durable OutcomeMetricObservation row. causalClaim is only none. */
export const outcomeMetricObservationRecordV0 = z.object({
  ...feedbackEnvelopeV0,
  deliverableRef: exactSubjectRefV0,
  conceptRef: exactSubjectRefV0,
  metricDefinitionRef: z.object({
    metricKey: z.string().min(1),
    definitionVersion: z.string().min(1),
  }).strict(),
  value: metricValueV0,
  currencyCode: z.string().regex(/^[A-Z]{3}$/).nullable(),
  measurementWindow: z.object({
    start: z.iso.datetime(),
    end: z.iso.datetime(),
    timezone: z.string().min(1).max(80),
  }).strict(),
  observedAt: z.iso.datetime(),
  marketRegion: z.string().min(1).max(80),
  channel: z.string().min(1).max(80),
  sourceType: z.enum(['manual_entry', 'authorized_export']),
  sourceRef: outcomeSourceRefV0,
  sourceFieldName: z.string().max(200).nullable(),
  verificationStatus: z.enum(['self_reported', 'source_attached', 'verified_against_source', 'not_verifiable']),
  dimensions: z.array(z.string().min(1).max(80)),
  limitations: z.array(z.string().max(500)),
  causalClaim: z.literal('none'),
  actor: feedbackActorV0,
}).strict()

/** Durable OutcomeMetricObservation record. */
export type OutcomeMetricObservationRecordV0 = z.infer<typeof outcomeMetricObservationRecordV0>
