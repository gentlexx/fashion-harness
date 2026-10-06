/**
 * Fashion Feedback registry (`ctx.fashionFeedbackRegistry`): durable designer
 * feedback and later outcome facts over Storage Domain `fashion_feedback@0`.
 * @module @gentlexx/dsh-fashion-feedback
 */

import {
  DesignerFeedbackId as brandDesignerFeedbackId,
  DevelopmentEventId as brandDevelopmentEventId,
  FeedbackSubjectId as brandFeedbackSubjectId,
  OutcomeAvailabilityId as brandOutcomeAvailabilityId,
  OutcomeMetricDefinitionId as brandOutcomeMetricDefinitionId,
  OutcomeMetricObservationId as brandOutcomeMetricObservationId,
} from './ids.ts'
import type {
  DesignerFeedbackId as DesignerFeedbackIdBrand,
  DevelopmentEventId as DevelopmentEventIdBrand,
  FeedbackSubjectId as FeedbackSubjectIdBrand,
  OutcomeAvailabilityId as OutcomeAvailabilityIdBrand,
  OutcomeMetricDefinitionId as OutcomeMetricDefinitionIdBrand,
  OutcomeMetricObservationId as OutcomeMetricObservationIdBrand,
} from './types.ts'

export type {
  AggregationSemantics,
  CurrentDevelopmentStage,
  CurrentOutcomeAvailability,
  DesignerFeedback,
  DevelopmentEvent,
  DevelopmentStage,
  ExactSubjectRef,
  FeedbackAction,
  FeedbackActor,
  FeedbackActorKind,
  FeedbackDataReality,
  FeedbackEnvelope,
  FeedbackModification,
  FeedbackOrigin,
  FeedbackReasonCode,
  FeedbackSubjectRef,
  FeedbackSubjectType,
  FeedbackSummary,
  FeedbackVisibility,
  MeasurementWindow,
  MetricTimeline,
  MetricValue,
  MetricValueType,
  OutcomeAvailability,
  OutcomeAvailabilityState,
  OutcomeMetricDefinitionRef,
  OutcomeMetricObservation,
  OutcomeSourceKind,
  OutcomeSourceRef,
  OutcomeSourceType,
  OutcomeTimeline,
  ProfessionalValidity,
  RevisionEffort,
  TimeSavedEstimate,
  VerificationStatus,
  WorkflowStepRef,
} from './types.ts'
export { FASHION_FEEDBACK_SCHEMA_VERSION } from './types.ts'

/** Branded identities; factories below share these names. */
export type DesignerFeedbackId = DesignerFeedbackIdBrand
export type DevelopmentEventId = DevelopmentEventIdBrand
export type FeedbackSubjectId = FeedbackSubjectIdBrand
export type OutcomeAvailabilityId = OutcomeAvailabilityIdBrand
export type OutcomeMetricDefinitionId = OutcomeMetricDefinitionIdBrand
export type OutcomeMetricObservationId = OutcomeMetricObservationIdBrand

/** @param id - Raw id. @returns branded DesignerFeedbackId. */
export function DesignerFeedbackId(id: string): DesignerFeedbackId {
  return brandDesignerFeedbackId(id)
}
/** @param id - Raw id. @returns branded OutcomeAvailabilityId. */
export function OutcomeAvailabilityId(id: string): OutcomeAvailabilityId {
  return brandOutcomeAvailabilityId(id)
}
/** @param id - Raw id. @returns branded DevelopmentEventId. */
export function DevelopmentEventId(id: string): DevelopmentEventId {
  return brandDevelopmentEventId(id)
}
/** @param id - Raw id. @returns branded OutcomeMetricObservationId. */
export function OutcomeMetricObservationId(id: string): OutcomeMetricObservationId {
  return brandOutcomeMetricObservationId(id)
}
/** @param id - Raw id. @returns branded OutcomeMetricDefinitionId. */
export function OutcomeMetricDefinitionId(id: string): OutcomeMetricDefinitionId {
  return brandOutcomeMetricDefinitionId(id)
}
/** @param id - Raw id. @returns branded FeedbackSubjectId. */
export function FeedbackSubjectId(id: string): FeedbackSubjectId {
  return brandFeedbackSubjectId(id)
}

export {
  FashionFeedbackAvailabilityValueForbiddenError,
  FashionFeedbackCrossProjectError,
  FashionFeedbackCurrencyRequiredError,
  FashionFeedbackHumanRequiredError,
  FashionFeedbackIdCollisionError,
  FashionFeedbackInvalidInputError,
  FashionFeedbackInvalidWindowError,
  FashionFeedbackMetricDefinitionMismatchError,
  FashionFeedbackNotFoundError,
  FashionFeedbackProjectNotFoundError,
  FashionFeedbackProjectReadOnlyError,
  FashionFeedbackRevisionConflictError,
  FashionFeedbackSeedConflictError,
  FashionFeedbackSourceRequiredError,
  FashionFeedbackSupersedesConflictError,
  FashionFeedbackTargetRevisionMissingError,
  FashionFeedbackTargetStaleError,
  FashionFeedbackUnitMismatchError,
} from './errors.ts'

export { compareFeedbackRecordedDesc } from './order.ts'
export type { FeedbackListOrderable } from './order.ts'
export { FASHION_FEEDBACK_DOMAIN_VERSION, fashionFeedbackDomainSpec } from './spec.ts'
export { METRIC_CATALOG, METRIC_CATALOG_VERSION } from './catalog.ts'
export { FashionFeedbackRegistry, R0_AVAILABILITY_ID, R0_FEEDBACK_ID } from './registry.ts'
export { FashionFeedbackRegistry as default } from './registry.ts'
