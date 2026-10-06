/**
 * Branded identity factories for Fashion Feedback.
 * @module @gentlexx/dsh-fashion-feedback/src/ids
 */

import { brandString } from '@deepseek-ai/dsh-brand'
import type {
  DesignerFeedbackId,
  DevelopmentEventId,
  FeedbackSubjectId,
  OutcomeAvailabilityId,
  OutcomeMetricDefinitionId,
  OutcomeMetricObservationId,
} from './types.ts'

/** @param id - Raw feedback id. @returns branded DesignerFeedbackId. */
export function DesignerFeedbackId(id: string): DesignerFeedbackId {
  return brandString<DesignerFeedbackId>(id)
}

/** @param id - Raw availability id. @returns branded OutcomeAvailabilityId. */
export function OutcomeAvailabilityId(id: string): OutcomeAvailabilityId {
  return brandString<OutcomeAvailabilityId>(id)
}

/** @param id - Raw development event id. @returns branded DevelopmentEventId. */
export function DevelopmentEventId(id: string): DevelopmentEventId {
  return brandString<DevelopmentEventId>(id)
}

/** @param id - Raw observation id. @returns branded OutcomeMetricObservationId. */
export function OutcomeMetricObservationId(id: string): OutcomeMetricObservationId {
  return brandString<OutcomeMetricObservationId>(id)
}

/** @param id - Raw definition id. @returns branded OutcomeMetricDefinitionId. */
export function OutcomeMetricDefinitionId(id: string): OutcomeMetricDefinitionId {
  return brandString<OutcomeMetricDefinitionId>(id)
}

/** @param id - Raw subject id. @returns branded FeedbackSubjectId. */
export function FeedbackSubjectId(id: string): FeedbackSubjectId {
  return brandString<FeedbackSubjectId>(id)
}
