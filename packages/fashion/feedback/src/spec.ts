/**
 * Fashion Feedback domain declaration opened by the registry.
 * @module @gentlexx/dsh-fashion-feedback/src/spec
 */

import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type {
  DesignerFeedbackId,
  DevelopmentEventId,
  OutcomeAvailabilityId,
  OutcomeMetricDefinitionId,
  OutcomeMetricObservationId,
} from './types.ts'
import {
  designerFeedbackRecordV0,
  developmentEventRecordV0,
  outcomeAvailabilityRecordV0,
  outcomeMetricDefinitionRecordV0,
  outcomeMetricObservationRecordV0,
  type DesignerFeedbackRecordV0,
  type DevelopmentEventRecordV0,
  type OutcomeAvailabilityRecordV0,
  type OutcomeMetricDefinitionRecordV0,
  type OutcomeMetricObservationRecordV0,
} from './schema/v0/records.ts'

/** Current Storage Domain version for fashion_feedback. */
export const FASHION_FEEDBACK_DOMAIN_VERSION = 0

/**
 * Domain `fashion_feedback@0`: authoritative tables for feedback and outcome facts.
 * Invalid records reject open; no compatibleVersions in v0.
 */
export const fashionFeedbackDomainSpec = defineDomain({
  name: 'fashion_feedback',
  version: FASHION_FEEDBACK_DOMAIN_VERSION,
  tables: {
    designer_feedback: domainTable<DesignerFeedbackId, DesignerFeedbackRecordV0>(designerFeedbackRecordV0),
    outcome_availability: domainTable<OutcomeAvailabilityId, OutcomeAvailabilityRecordV0>(outcomeAvailabilityRecordV0),
    development_events: domainTable<DevelopmentEventId, DevelopmentEventRecordV0>(developmentEventRecordV0),
    outcome_metric_definitions: domainTable<OutcomeMetricDefinitionId, OutcomeMetricDefinitionRecordV0>(outcomeMetricDefinitionRecordV0),
    outcome_metric_observations: domainTable<OutcomeMetricObservationId, OutcomeMetricObservationRecordV0>(
      outcomeMetricObservationRecordV0,
    ),
  },
})

export type {
  DesignerFeedbackRecordV0,
  DevelopmentEventRecordV0,
  OutcomeAvailabilityRecordV0,
  OutcomeMetricDefinitionRecordV0,
  OutcomeMetricObservationRecordV0,
}
